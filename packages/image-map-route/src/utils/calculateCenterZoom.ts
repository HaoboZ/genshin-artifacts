import { type Point } from '../types';
import { offsetToZoom } from './offsetToZoom';

export function calculateCenterZoom(point: Point, containerSize: DOMRect, scale: number) {
	if (!point || !containerSize?.width || !containerSize?.height || !scale) {
		return { scale: 1, offset: { x: 0, y: 0 } };
	}

	// Convert normalized point (0-1) to pixel coordinates
	const pointX = point.x * containerSize.width;
	const pointY = point.y * containerSize.height;

	// Calculate offset to center the point
	const offsetX = (containerSize.width / 2 - pointX) * scale;
	const offsetY = (containerSize.height / 2 - pointY) * scale;

	return offsetToZoom(offsetX, offsetY, containerSize, scale);
}
