export default function drawImageData(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
) {
	context.strokeRect(x, y, width, height);
	return context.getImageData(x, y, width, height).data;
}
