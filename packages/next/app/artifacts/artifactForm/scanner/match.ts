import pixelmatch from 'pixelmatch';

// Function to resize canvas
function resizeCanvas(sourceCanvas, width, height) {
	const resizedCanvas = document.createElement('canvas');
	const ctx = resizedCanvas.getContext('2d');
	resizedCanvas.width = width;
	resizedCanvas.height = height;
	ctx.drawImage(sourceCanvas, 0, 0, width, height);
	return resizedCanvas;
}

export default async function match(canvas: HTMLCanvasElement, template?: HTMLCanvasElement) {
	if (!template) {
		template = await new Promise<HTMLCanvasElement>((resolve, reject) => {
			const img = new Image();
			img.src = '/template.png';
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				resolve(canvas);
			};
			img.onerror = (err) => reject(err);
		});
	}
	canvas = resizeCanvas(canvas, template.width, template.height);

	const context1 = canvas.getContext('2d');
	const context2 = template.getContext('2d');
	const imgData1 = context1.getImageData(0, 0, canvas.width, canvas.height);
	const imgData2 = context2.getImageData(0, 0, template.width, template.height);

	return pixelmatch(imgData1.data, imgData2.data, null, canvas.width, canvas.height, {
		threshold: 0.4,
	});
}
