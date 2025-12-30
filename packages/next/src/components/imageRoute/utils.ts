import { clamp } from 'remeda';
import { type Point, type Spot } from './types';

export function clampPosition(containerSize: DOMRect, x: number, y: number, currentScale: number) {
	const imageWidth = containerSize.width * currentScale;
	const imageHeight = containerSize.height * currentScale;

	// calculate bounds - image must stay within container
	const minX = containerSize.width - imageWidth;
	const maxX = 0;
	const minY = containerSize.height - imageHeight;
	const maxY = 0;

	return {
		x: clamp(x, { min: minX, max: maxX }),
		y: clamp(y, { min: minY, max: maxY }),
	};
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
	if (!points || !points.length) return null;

	// helper to get start time (first point defaults to 0)
	const getStart = (p: Point, idx: number) => p.start ?? (idx === 0 ? 0 : undefined);

	let lastValidPoint = null;
	// iterate through points to find the spot
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const pointStart = getStart(point, i);
		if (pointStart === undefined) continue;

		const pointEnd = point.end ?? pointStart;

		// time is at this point
		if (time >= pointStart && time <= pointEnd) {
			return { point, pointIndex: i, percentage: 0 };
		}

		if (time > pointStart) {
			lastValidPoint = i;
			continue;
		}

		// time is between lastValidPoint and current point
		if (lastValidPoint === null) break;

		const prevPoint = points[lastValidPoint];
		const prevEnd = prevPoint.end ?? getStart(prevPoint, lastValidPoint);
		const segmentPoints = points.slice(lastValidPoint, i + 1);

		// calculate cumulative distances
		const distances: number[] = [0];
		let totalDistance = 0;
		for (let j = 1; j < segmentPoints.length; j++) {
			const dx = segmentPoints[j].x - segmentPoints[j - 1].x;
			const dy = segmentPoints[j].y - segmentPoints[j - 1].y;
			totalDistance += Math.sqrt(dx * dx + dy * dy);
			distances.push(totalDistance);
		}

		if (totalDistance === 0) break;

		// interpolate position based on time
		const timePercentage = (time - prevEnd) / (pointStart - prevEnd);
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
			point: {
				x: p1.x + (p2.x - p1.x) * segT,
				y: p1.y + (p2.y - p1.y) * segT,
			},
			pointIndex: lastValidPoint + segIdx,
			percentage: Math.round(segT * 1000) / 10,
		};
	}

	// time is beyond all points, return last valid point
	if (lastValidPoint !== null) {
		return {
			point: points[lastValidPoint],
			pointIndex: Math.max(0, lastValidPoint - 1),
			percentage: 100,
		};
	}

	return null;
}

// find time based on spot
export function findTimeBySpot(points: Point[], spot: Spot) {
	if (!spot || spot.pointIndex < 0 || spot.pointIndex >= points.length - 1) return null;

	// check if we're snapped directly to a point
	if (spot.percentage === 100) {
		const pointIdx = spot.pointIndex + 1;
		if (pointIdx < points.length && points[pointIdx].start !== undefined) {
			return points[pointIdx].start;
		}
	} else if (spot.percentage === 0) {
		const pointIdx = spot.pointIndex;
		if (pointIdx >= 0 && points[pointIdx].start !== undefined) {
			return points[pointIdx].start;
		}
	}

	// find the timing segment this visual segment belongs to
	let timingStartIdx = spot.pointIndex;
	while (timingStartIdx >= 0) {
		if (points[timingStartIdx].start !== undefined) break;
		timingStartIdx--;
	}

	if (timingStartIdx < 0) return null;
	const startPoint = points[timingStartIdx];
	const startPointEnd = startPoint.end ?? startPoint.start;

	// find the next point with start time
	let timingEndIdx = spot.pointIndex + 1;
	while (timingEndIdx < points.length) {
		if (points[timingEndIdx].start !== undefined) break;
		timingEndIdx++;
	}

	if (timingEndIdx >= points.length) return null;
	const endPoint = points[timingEndIdx];

	// calculate total path distance from timing start to timing end
	const pathPoints = points.slice(timingStartIdx, timingEndIdx + 1);
	let totalDistance = 0;
	const distances: number[] = [0];

	for (let i = 1; i < pathPoints.length; i++) {
		const dx = pathPoints[i].x - pathPoints[i - 1].x;
		const dy = pathPoints[i].y - pathPoints[i - 1].y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		totalDistance += dist;
		distances.push(totalDistance);
	}

	// calculate distance to the current spot
	const pointIndexInPath = spot.pointIndex - timingStartIdx;
	const distanceToSegmentStart = distances[pointIndexInPath];

	// add the percentage along the current segment
	const segmentStart = pathPoints[pointIndexInPath];
	const segmentEnd = pathPoints[pointIndexInPath + 1];
	const dx = segmentEnd.x - segmentStart.x;
	const dy = segmentEnd.y - segmentStart.y;
	const segmentLength = Math.sqrt(dx * dx + dy * dy);
	const distanceInSegment = segmentLength * (spot.percentage / 100);

	const totalDistanceToSpot = distanceToSegmentStart + distanceInSegment;

	// calculate time based on distance ratio
	const distanceRatio = totalDistanceToSpot / totalDistance;
	const segmentDuration = endPoint.start - startPointEnd;
	return startPointEnd + segmentDuration * distanceRatio;
}

export function calculateOptimalZoom(points: Point[], containerSize: DOMRect, zoom: number = 0.8) {
	if (!containerSize || points.length === 0) {
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

	const scale = Math.min(scaleX, scaleY, 3);

	// calculate offset to center the bounding box
	const containerCenterX = containerSize.width / 2;
	const containerCenterY = containerSize.height / 2;

	const offsetX = containerCenterX - boundingBox.centerX * scale;
	const offsetY = containerCenterY - boundingBox.centerY * scale;

	return { scale, offset: { x: offsetX, y: offsetY } };
}
