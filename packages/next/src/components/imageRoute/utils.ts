import { clamp } from 'remeda';
import { type Point, type Spot } from './types';

export function clampPosition(containerSize: DOMRect, x: number, y: number, currentScale: number) {
	const imageWidth = containerSize.width * currentScale;
	const imageHeight = containerSize.height * currentScale;

	// calculate bounds - with center origin, the offset represents the center position
	const halfScaledWidth = (imageWidth - containerSize.width) / 2;
	const halfScaledHeight = (imageHeight - containerSize.height) / 2;

	return {
		x: clamp(x, { min: -halfScaledWidth, max: halfScaledWidth }),
		y: clamp(y, { min: -halfScaledHeight, max: halfScaledHeight }),
	};
}

export function mouseToContainer(
	mouse: { clientX: number; clientY: number },
	containerSize: DOMRect,
	mapOffset: { x: number; y: number },
	scale: number,
) {
	const centerX = containerSize.width / 2;
	const centerY = containerSize.height / 2;
	const mouseX = (mouse.clientX - containerSize.x - centerX - mapOffset.x) / scale;
	const mouseY = (mouse.clientY - containerSize.y - centerY - mapOffset.y) / scale;
	const normalizedX = (mouseX + centerX) / containerSize.width;
	const normalizedY = (mouseY + centerY) / containerSize.height;
	return { x: normalizedX, y: normalizedY };
}

// calculate closest point on path with segment info and snapping
export function getClosestPointOnPath(
	points: Point[],
	mouseX: number,
	mouseY: number,
	snapThreshold: number,
): Spot {
	if (!points || points.length < 2) return null;

	let closestPoint = null;
	let minDistance = Infinity;
	let closestPointIndex = -1;
	let segmentPercentage = 0;

	// check each segment
	for (let i = 1; i < points.length; i++) {
		const x1 = points[i - 1].x;
		const y1 = points[i - 1].y;
		const x2 = points[i].x;
		const y2 = points[i].y;

		const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 2;

		// vector from start to end of segment
		const dx = x2 - x1;
		const dy = y2 - y1;

		// vector from start to mouse
		const mx = mouseX - x1;
		const my = mouseY - y1;

		// project mouse onto segment
		const t = clamp((mx * dx + my * dy) / segmentLength, {
			min: 0,
			max: 1,
		});

		// closest point on this segment
		let px = x1 + t * dx;
		let py = y1 + t * dy;

		// check if we should snap to start point
		const distToStart = Math.sqrt((mouseX - x1) ** 2 + (mouseY - y1) ** 2);
		const distToEnd = Math.sqrt((mouseX - x2) ** 2 + (mouseY - y2) ** 2);

		let snappedT = t;
		let preferredSegmentIndex = i - 1;

		if (points[i - 1].marked && distToStart < snapThreshold && distToStart < distToEnd) {
			px = x1;
			py = y1;
			snappedT = 0;
		} else if (points[i].marked && distToEnd < snapThreshold) {
			px = x2;
			py = y2;
			preferredSegmentIndex = i;
			snappedT = 0;
		}

		// distance from mouse to closest point
		const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);

		if (dist < minDistance) {
			minDistance = dist;
			closestPoint = { x: px, y: py };
			closestPointIndex = preferredSegmentIndex;
			segmentPercentage = snappedT * 100;
		}
	}

	if (minDistance >= snapThreshold) return null;

	return {
		point: closestPoint,
		pointIndex: closestPointIndex,
		percentage: Math.round(segmentPercentage * 10) / 10,
	};
}

// find active spot based on time
export function findSpotByTime(points: Point[], time: number): Spot {
	if (!points?.length) return null;

	let lastPoint = { point: points[0], i: 0, maxTime: 0 };
	// iterate through points to find the spot
	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		if (point.start === undefined && point.end === undefined && point.marked === undefined)
			continue;

		const minTime = point.start ?? point.marked ?? 0;
		const maxTime = point.end ?? point.marked ?? point.start ?? 0;

		// time is at this point
		if (minTime <= time && time <= maxTime) {
			return { point, pointIndex: i, percentage: 0 };
		}

		if (time > maxTime) {
			lastPoint = { point, i, maxTime };
			continue;
		}

		const startTime = point.start ?? point.marked ?? point.end ?? 0;
		const endTime = lastPoint.maxTime;
		const segmentPoints = points.slice(lastPoint.i, i + 1);

		// calculate cumulative distances
		const distances: number[] = [0];
		let totalDistance = 0;
		for (let j = 1; j < segmentPoints.length; j++) {
			const dx = segmentPoints[j].x - segmentPoints[j - 1].x;
			const dy = segmentPoints[j].y - segmentPoints[j - 1].y;
			totalDistance += Math.sqrt(dx * dx + dy * dy);
			distances.push(totalDistance);
		}

		if (totalDistance === 0) {
			return { point: lastPoint.point, pointIndex: lastPoint.i, percentage: 0 };
		}

		// interpolate position based on time
		const timePercentage = (time - endTime) / (startTime - endTime);
		const targetDistance = totalDistance * timePercentage;

		// find segment containing target distance
		let segIdx = distances.findIndex((d, idx) => idx > 0 && targetDistance <= d) - 1;
		if (segIdx < 0) segIdx = distances.length - 2;

		// interpolate within segment
		const segStart = distances[segIdx];
		const segEnd = distances[segIdx + 1];
		const segT = (targetDistance - segStart) / (segEnd - segStart);

		const p1 = segmentPoints[segIdx];
		const p2 = segmentPoints[segIdx + 1];

		return {
			point: { x: p1.x + (p2.x - p1.x) * segT, y: p1.y + (p2.y - p1.y) * segT },
			pointIndex: lastPoint.i + segIdx,
			percentage: Math.round(segT * 1000) / 10,
		};
	}

	// time is beyond all points, return last point
	return {
		point: points[points.length - 1],
		pointIndex: points.length - 1,
		percentage: 0,
	};
}

// find time based on spot
export function findTimeBySpot(points: Point[], spot: Spot) {
	if (!points?.length || !spot) return null;

	// check if we're snapped directly to a point
	if (spot.percentage === 100) {
		const point = points[spot.pointIndex + 1];
		const res = point.marked ?? point.start;
		if (res) return res;
	} else if (spot.percentage === 0) {
		const point = points[spot.pointIndex];
		return point.marked ?? point.start ?? 0;
	}

	// find timing segment boundaries in a single pass
	let startIdx = 0;
	let endIdx = points.length - 1;

	for (let i = spot.pointIndex; i >= 0; i--) {
		if (points[i].start ?? points[i].marked ?? points[i].end) {
			startIdx = i;
			break;
		}
	}

	for (let i = spot.pointIndex + 1; i < points.length; i++) {
		if (points[i].start ?? points[i].marked ?? points[i].end) {
			endIdx = i;
			break;
		}
	}

	const startPoint = points[startIdx];
	const endPoint = points[endIdx];
	const startPointTime = startPoint.end ?? startPoint.marked ?? startPoint.start;
	const endPointTime = endPoint.start ?? endPoint.marked ?? endPoint.end;

	// calculate cumulative distances along the path
	const pathPoints = points.slice(startIdx, endIdx + 1);
	const distances: number[] = [0];
	let totalDistance = 0;

	for (let i = 1; i < pathPoints.length; i++) {
		const dx = pathPoints[i].x - pathPoints[i - 1].x;
		const dy = pathPoints[i].y - pathPoints[i - 1].y;
		totalDistance += Math.sqrt(dx * dx + dy * dy);
		distances.push(totalDistance);
	}

	if (totalDistance === 0) return startPointTime;

	// calculate distance to the spot
	const pointIndexInPath = spot.pointIndex - startIdx;
	const distanceToSegmentStart = distances[pointIndexInPath];

	const segmentStart = pathPoints[pointIndexInPath];
	const segmentEnd = pathPoints[pointIndexInPath + 1];
	const dx = segmentEnd.x - segmentStart.x;
	const dy = segmentEnd.y - segmentStart.y;
	const segmentLength = Math.sqrt(dx * dx + dy * dy);

	const totalDistanceToSpot = distanceToSegmentStart + segmentLength * (spot.percentage / 100);

	// interpolate time based on distance ratio
	const distanceRatio = totalDistanceToSpot / totalDistance;
	return startPointTime + (endPointTime - startPointTime) * distanceRatio;
}

export function calculateOptimalZoom(
	points: Point[],
	containerSize: DOMRect,
	zoom: number,
	maxScale: number = 2,
) {
	if (!points?.length || !containerSize?.width || !containerSize?.height || !zoom) {
		return { scale: 1, offset: { x: 0, y: 0 } };
	}
	// find bounding box of all points (normalized coordinates)
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;

	for (const point of points) {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	}

	// convert to pixel coordinates
	const boundingBox = {
		width: (maxX - minX) * containerSize.width,
		height: (maxY - minY) * containerSize.height,
		centerX: ((minX + maxX) / 2) * containerSize.width,
		centerY: ((minY + maxY) / 2) * containerSize.height,
	};

	// calculate scale to fit bounding box with some padding
	const scaleX = (containerSize.width * zoom) / boundingBox.width;
	const scaleY = (containerSize.height * zoom) / boundingBox.height;

	const scale = Math.max(1, Math.min(scaleX, scaleY, maxScale));

	// calculate offset to center the bounding box
	const containerCenterX = containerSize.width / 2;
	const containerCenterY = containerSize.height / 2;

	// we need to translate the image center by -offsetToBounding * scale
	let offsetX = -(boundingBox.centerX - containerCenterX) * scale;
	let offsetY = -(boundingBox.centerY - containerCenterY) * scale;

	// constrain offset to never show beyond image bounds
	const halfScaledWidth = (containerSize.width * scale - containerSize.width) / 2;
	const halfScaledHeight = (containerSize.height * scale - containerSize.height) / 2;

	offsetX = clamp(offsetX, { min: -halfScaledWidth, max: halfScaledWidth });
	offsetY = clamp(offsetY, { min: -halfScaledHeight, max: halfScaledHeight });

	return { scale, offset: { x: offsetX, y: offsetY } };
}

export function calculateCenterZoom(point: Point, containerSize: DOMRect, scale: number) {
	if (!point || !containerSize?.width || !containerSize?.height || !scale) {
		return { scale: 1, offset: { x: 0, y: 0 } };
	}

	// convert normalized point (0-1) to pixel coordinates
	const pointX = point.x * containerSize.width;
	const pointY = point.y * containerSize.height;

	// calculate offset to center the point
	let offsetX = (containerSize.width / 2 - pointX) * scale;
	let offsetY = (containerSize.height / 2 - pointY) * scale;

	// constrain offset to never show beyond image bounds
	const halfScaledWidth = (containerSize.width * scale - containerSize.width) / 2;
	const halfScaledHeight = (containerSize.height * scale - containerSize.height) / 2;

	offsetX = clamp(offsetX, { min: -halfScaledWidth, max: halfScaledWidth });
	offsetY = clamp(offsetY, { min: -halfScaledHeight, max: halfScaledHeight });

	return { scale, offset: { x: offsetX, y: offsetY } };
}
