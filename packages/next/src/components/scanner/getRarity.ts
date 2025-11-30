import drawImageData from './drawImageData';
import setupContext from './setupContext';

const iconAreas = [
	[5, 164],
	[4, 130],
	[3, 96],
];

export default function getRarity(canvas: HTMLCanvasElement, newCanvas?: HTMLCanvasElement) {
	const context = setupContext(canvas, newCanvas);

	for (const [rarity, x] of iconAreas) {
		const data = drawImageData(context, x, 240, 32, 32);

		const numPixels = data.length / 4;

		let meanIntensity = 0;
		// Calculate the mean intensity
		for (let i = 0; i < data.length; i += 4) {
			meanIntensity += data[i];
		}
		meanIntensity /= numPixels;

		// Calculate the variance
		let variance = 0;
		for (let i = 0; i < data.length; i += 4) {
			variance += Math.pow(data[i] - meanIntensity, 2);
		}
		variance /= numPixels;

		if (variance > 400) return rarity;
	}
}
