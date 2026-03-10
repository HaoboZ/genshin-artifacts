import { type Point, type Spot } from '../types';

// Find time based on spot
export function findTimeBySpot(points: Point[], spot: Spot) {
	if (!points?.length || !spot) return null;

	// Check if we're snapped directly to a point
	if (spot.percentage === 100) {
		const point = points[spot.pointIndex + 1];
		const res = point.marked ?? point.start;
		if (res) return res;
	} else if (spot.percentage === 0) {
		const point = points[spot.pointIndex];
		return point.marked ?? point.start ?? 0;
	}

	// Find timing segment boundaries in a single pass
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

	// Calculate cumulative distances along the path
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

	// Calculate distance to the spot
	const pointIndexInPath = spot.pointIndex - startIdx;
	const distanceToSegmentStart = distances[pointIndexInPath];

	const segmentStart = pathPoints[pointIndexInPath];
	const segmentEnd = pathPoints[pointIndexInPath + 1];
	const dx = segmentEnd.x - segmentStart.x;
	const dy = segmentEnd.y - segmentStart.y;
	const segmentLength = Math.sqrt(dx * dx + dy * dy);

	const totalDistanceToSpot = distanceToSegmentStart + segmentLength * (spot.percentage / 100);

	// Interpolate time based on distance ratio
	const distanceRatio = totalDistanceToSpot / totalDistance;
	return startPointTime + (endPointTime - startPointTime) * distanceRatio;
}
