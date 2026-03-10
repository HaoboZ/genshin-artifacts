import { clamp } from 'remeda';
import { type Point, type Spot } from '../types';

// Calculate closest point on path with segment info and snapping
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

	// Check each segment
	for (let i = 1; i < points.length; i++) {
		const x1 = points[i - 1].x;
		const y1 = points[i - 1].y;
		const x2 = points[i].x;
		const y2 = points[i].y;

		const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 2;

		// Vector from start to end of segment
		const dx = x2 - x1;
		const dy = y2 - y1;

		// Vector from start to mouse
		const mx = mouseX - x1;
		const my = mouseY - y1;

		// Project mouse onto segment
		const t = clamp((mx * dx + my * dy) / segmentLength, {
			min: 0,
			max: 1,
		});

		// Closest point on this segment
		let px = x1 + t * dx;
		let py = y1 + t * dy;

		// Check if we should snap to start point
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

		// Distance from mouse to closest point
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
