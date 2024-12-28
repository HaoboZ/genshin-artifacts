export default function lock(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	const scale = canvas.width;

	const iconData = ctx.getImageData(
		0.747 * scale,
		0.609 * scale,
		0.085 * scale,
		0.085 * scale,
	).data;
	const backData = ctx.getImageData(
		0.631 * scale,
		0.609 * scale,
		0.085 * scale,
		0.085 * scale,
	).data;

	let totalPixels = 0;
	let iconDiffPixels = 0;
	for (let i = 0; i < iconData.length; i += 4) {
		const iconGray = iconData[i];
		const bgGray = backData[i];

		++totalPixels;
		if (Math.abs(iconGray - bgGray) > 60) iconDiffPixels++;
	}

	return iconDiffPixels / totalPixels > 0.5;
}
