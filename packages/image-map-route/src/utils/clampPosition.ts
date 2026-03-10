import { clamp } from 'remeda';

export function clampPosition(containerSize: DOMRect, x: number, y: number, currentScale: number) {
	const imageWidth = containerSize.width * currentScale;
	const imageHeight = containerSize.height * currentScale;

	// Calculate bounds - with center origin, the offset represents the center position
	const halfScaledWidth = (imageWidth - containerSize.width) / 2;
	const halfScaledHeight = (imageHeight - containerSize.height) / 2;

	return {
		x: clamp(x, { min: -halfScaledWidth, max: halfScaledWidth }),
		y: clamp(y, { min: -halfScaledHeight, max: halfScaledHeight }),
	};
}
