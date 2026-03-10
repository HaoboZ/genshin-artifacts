import { clamp } from 'remeda';

export function offsetToZoom(
	offsetX: number,
	offsetY: number,
	containerSize: DOMRect,
	scale: number,
) {
	// Constrain offset to never show beyond image bounds
	const halfScaledWidth = (containerSize.width * scale - containerSize.width) / 2;
	const halfScaledHeight = (containerSize.height * scale - containerSize.height) / 2;

	offsetX = clamp(offsetX, { min: -halfScaledWidth, max: halfScaledWidth });
	offsetY = clamp(offsetY, { min: -halfScaledHeight, max: halfScaledHeight });

	return { scale, offset: { x: offsetX, y: offsetY } };
}
