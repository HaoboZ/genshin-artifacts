import { type Point, type Spot } from '../types';

// Find active spot based on time
export function findSpotByTime(points: Point[], time: number): Spot {
	if (!points?.length) return null;

	let lastPoint = { point: points[0], i: 0, maxTime: 0 };
	// Iterate through points to find the spot
	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		if (point.start === undefined && point.end === undefined && point.marked === undefined)
			continue;

		const minTime = point.start ?? point.marked ?? 0;
		const maxTime = point.end ?? point.marked ?? point.start ?? 0;

		// Time is at this point
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

		// Calculate cumulative distances
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

		// Interpolate position based on time
		const timePercentage = (time - endTime) / (startTime - endTime);
		const targetDistance = totalDistance * timePercentage;

		// Find segment containing target distance
		let segIdx = distances.findIndex((d, idx) => idx > 0 && targetDistance <= d) - 1;
		if (segIdx < 0) segIdx = distances.length - 2;

		// Interpolate within segment
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

	// Time is beyond all points, return last point
	return {
		point: points[points.length - 1],
		pointIndex: points.length - 1,
		percentage: 0,
	};
}
