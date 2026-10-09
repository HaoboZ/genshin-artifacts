import pixelmatch from 'pixelmatch';

export default async function matchPixels(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
	if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
		throw new Error('Cannot compare canvases with different dimensions');
	}

	// Comparing a full-resolution shared screen every second is expensive.
	// Downsample first, then scale the result back to approximate changed source
	// pixels so existing thresholds continue to have roughly the same meaning.
	const scale = Math.min(1, 480 / Math.max(canvas1.width, canvas1.height));
	const width = Math.max(1, Math.round(canvas1.width * scale));
	const height = Math.max(1, Math.round(canvas1.height * scale));
	const scaledCanvas1 = document.createElement('canvas');
	const scaledCanvas2 = document.createElement('canvas');
	scaledCanvas1.width = scaledCanvas2.width = width;
	scaledCanvas1.height = scaledCanvas2.height = height;
	const context1 = scaledCanvas1.getContext('2d');
	const context2 = scaledCanvas2.getContext('2d');
	context1.drawImage(canvas1, 0, 0, width, height);
	context2.drawImage(canvas2, 0, 0, width, height);
	const imgData1 = context1.getImageData(0, 0, width, height);
	const imgData2 = context2.getImageData(0, 0, width, height);

	const changedPixels = pixelmatch(imgData1.data, imgData2.data, null, width, height, {
		threshold: 0.4,
	});
	return Math.round((changedPixels * canvas1.width * canvas1.height) / (width * height));
}
