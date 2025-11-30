export default function resizeScale(canvas: HTMLCanvasElement) {
	const newCanvas = document.createElement('canvas');
	const ctx = newCanvas.getContext('2d');
	const height = (500 * canvas.height) / canvas.width;
	newCanvas.width = 500;
	newCanvas.height = height;
	ctx.drawImage(canvas, 0, 0, 500, height);
	return newCanvas;
}
