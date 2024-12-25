const iconAreas = [
	[5, 0.324],
	[4, 0.257],
	[3, 0.19],
];

export default function rarity(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	const scale = canvas.width;

	for (const [rarity, offset] of iconAreas) {
		const { data } = ctx.getImageData(offset * scale, 0.48 * scale, 0.067 * scale, 0.067 * scale);
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
