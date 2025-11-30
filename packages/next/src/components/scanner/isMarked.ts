import drawImageData from './drawImageData';
import setupContext from './setupContext';

export default function isMarked(canvas: HTMLCanvasElement, newCanvas?: HTMLCanvasElement) {
	const context = setupContext(canvas, newCanvas);
	const backData = drawImageData(context, 315, 305, 40, 40);
	const lockData = drawImageData(context, 374, 305, 40, 40);
	const markData = drawImageData(context, 433, 305, 40, 40);

	let totalPixels = 0,
		lockDiffPixels = 0,
		markDiffPixels = 0;
	for (let i = 0; i < lockData.length; i += 4) {
		const bgPixel = backData[i];
		const lockPixel = lockData[i];
		const markPixel = markData[i];

		totalPixels++;
		if (Math.abs(lockPixel - bgPixel) > 60) lockDiffPixels++;
		if (Math.abs(markPixel - bgPixel) > 60) markDiffPixels++;
	}

	return {
		lock: lockDiffPixels / totalPixels > 0.5,
		astralMark: markDiffPixels / totalPixels > 0.5,
	};
}
