export function mouseToContainer(
	mouse: { clientX: number; clientY: number },
	containerSize: DOMRect,
	mapOffset: { x: number; y: number },
	scale: number,
) {
	const centerX = containerSize.width / 2;
	const centerY = containerSize.height / 2;
	const mouseX = (mouse.clientX - containerSize.x - centerX - mapOffset.x) / scale;
	const mouseY = (mouse.clientY - containerSize.y - centerY - mapOffset.y) / scale;
	const normalizedX = (mouseX + centerX) / containerSize.width;
	const normalizedY = (mouseY + centerY) / containerSize.height;
	return { x: normalizedX, y: normalizedY };
}
