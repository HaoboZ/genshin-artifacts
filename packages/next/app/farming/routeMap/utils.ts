import { clamp } from 'remeda';

export type Point = { x: number; y: number; artifact?: number; start?: number; end?: number };

export type Spot = {
	point: Point;
	pointIndex: number;
	percentage: number;
};

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
	containerSize: DOMRect,
	points: Point[],
	mouseX: number,
	mouseY: number,
) {
	if (!containerSize || points.length < 2) return null;

	const snapThreshold = 15; // snap within certain distance

	let closestPoint = null;
	let minDistance = Infinity;
	let closestPointIndex = -1;
	let segmentPercentage = 0;

	// check each segment
	for (let i = 1; i < points.length; i++) {
		const x1 = points[i - 1].x * containerSize.width;
		const y1 = points[i - 1].y * containerSize.height;
		const x2 = points[i].x * containerSize.width;
		const y2 = points[i].y * containerSize.height;

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
		if (points[i - 1].artifact && distToStart < snapThreshold && distToStart < distToEnd) {
			px = x1;
			py = y1;
			snappedT = 0;
		} else if (points[i].artifact && distToEnd < snapThreshold) {
			px = x2;
			py = y2;
			snappedT = 1;
		}

		// distance from mouse to closest point
		const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);

		if (dist < minDistance) {
			minDistance = dist;
			closestPoint = { x: px, y: py };
			closestPointIndex = i - 1;
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
	// find points with valid times
	const validPoints = points.filter((p) => p.start !== undefined && p.end !== undefined);
	if (validPoints.length < 2) return null;

	// check each point to see if time falls within it
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (point.start === undefined) continue;

		const pointEnd = point.end ?? point.start;

		// check if time is at this point
		if (time >= point.start && time <= pointEnd) {
			return {
				point: { x: point.x, y: point.y },
				pointIndex: Math.max(0, i - 1),
				percentage: i === 0 ? 0 : 100,
			};
		}

		// check if time is in segment between this point and next
		if (i < points.length - 1) {
			// find next valid point with times
			let nextValidPoint = null;
			let nextValidIndex = i + 1;
			while (nextValidIndex < points.length) {
				if (points[nextValidIndex].start !== undefined) {
					nextValidPoint = points[nextValidIndex];
					break;
				}
				nextValidIndex++;
			}

			if (!nextValidPoint || time <= pointEnd || time >= nextValidPoint.start) continue;

			// calculate cumulative distances for each segment
			const segmentPoints = points.slice(i, nextValidIndex + 1);
			const distances: number[] = [0];
			let totalDistance = 0;
			for (let j = 1; j < segmentPoints.length; j++) {
				const dx = segmentPoints[j].x - segmentPoints[j - 1].x;
				const dy = segmentPoints[j].y - segmentPoints[j - 1].y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				totalDistance += dist;
				distances.push(totalDistance);
			}

			// find position along the path based on time percentage
			const timePercentage = (time - pointEnd) / (nextValidPoint.start - pointEnd);
			const targetDistance = totalDistance * timePercentage;
			let segIdx = 0;
			for (let j = 1; j < distances.length; j++) {
				if (targetDistance <= distances[j]) {
					segIdx = j - 1;
					break;
				}
			}

			// interpolate within the found segment
			const segStart = distances[segIdx];
			const segEnd = distances[segIdx + 1];
			const segT = (targetDistance - segStart) / (segEnd - segStart);

			const p1 = segmentPoints[segIdx];
			const p2 = segmentPoints[segIdx + 1];

			return {
				point: { x: p1.x + (p2.x - p1.x) * segT, y: p1.y + (p2.y - p1.y) * segT },
				pointIndex: i + segIdx,
				percentage: Math.round(segT * 100 * 10) / 10,
			};
		}
	}

	return null;
}

// find time based on spot
export function findTimeBySpot(points: Point[], spot: Spot) {
	if (spot.pointIndex < 0 || spot.pointIndex >= points.length - 1) return null;

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
