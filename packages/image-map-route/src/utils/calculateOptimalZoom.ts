import { type Point } from '../types';
import { offsetToZoom } from './offsetToZoom';

export function calculateOptimalZoom(
	points: Point[],
	containerSize: DOMRect,
	zoom: number,
	maxScale: number = 2,
) {
	if (!points?.length || !containerSize?.width || !containerSize?.height || !zoom) {
		return { scale: 1, offset: { x: 0, y: 0 } };
	}
	// Find bounding box of all points (normalized coordinates)
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

	// Convert to pixel coordinates
	const boundingBox = {
		width: (maxX - minX) * containerSize.width,
		height: (maxY - minY) * containerSize.height,
		centerX: ((minX + maxX) / 2) * containerSize.width,
		centerY: ((minY + maxY) / 2) * containerSize.height,
	};

	// Calculate scale to fit bounding box with some padding
	const scaleX = (containerSize.width * zoom) / boundingBox.width;
	const scaleY = (containerSize.height * zoom) / boundingBox.height;

	const scale = Math.max(1, Math.min(scaleX, scaleY, maxScale));

	// Calculate offset to center the bounding box
	const containerCenterX = containerSize.width / 2;
	const containerCenterY = containerSize.height / 2;

	// We need to translate the image center by -offsetToBounding * scale
	const offsetX = -(boundingBox.centerX - containerCenterX) * scale;
	const offsetY = -(boundingBox.centerY - containerCenterY) * scale;

	return offsetToZoom(offsetX, offsetY, containerSize, scale);
}
