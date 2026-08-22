import { clamp } from 'remeda';

export function clampPosition(
	containerSize: DOMRect,
	x: number,
	y: number,
	currentScale: number,
	imageSize: DOMRect = containerSize,
) {
	const imageWidth = imageSize.width * currentScale;
	const imageHeight = imageSize.height * currentScale;

	// Calculate bounds - with center origin, the offset represents the center position
	const halfScaledWidth = Math.max(0, (imageWidth - containerSize.width) / 2);
	const halfScaledHeight = Math.max(0, (imageHeight - containerSize.height) / 2);

	return {
		x: clamp(x, { min: -halfScaledWidth, max: halfScaledWidth }),
		y: clamp(y, { min: -halfScaledHeight, max: halfScaledHeight }),
	};
}
