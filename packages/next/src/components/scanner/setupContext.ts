export default function setupContext(canvas: HTMLCanvasElement, newCanvas?: HTMLCanvasElement) {
	const context = (newCanvas || canvas).getContext('2d');
	if (newCanvas) {
		newCanvas.width = canvas.width;
		newCanvas.height = canvas.height;
		context.drawImage(canvas, 0, 0);
	}
	context.strokeStyle = 'green';
	context.lineWidth = 1;
	return context;
}
