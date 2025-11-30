import pixelmatch from 'pixelmatch';

export default async function matchPixels(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
	const context1 = canvas1.getContext('2d');
	const context2 = canvas2.getContext('2d');
	const imgData1 = context1.getImageData(0, 0, canvas1.width, canvas1.height);
	const imgData2 = context2.getImageData(0, 0, canvas1.width, canvas1.height);

	return pixelmatch(imgData1.data, imgData2.data, null, canvas1.width, canvas1.height, {
		threshold: 0.4,
	});
}
