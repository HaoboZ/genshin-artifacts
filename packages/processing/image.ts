import { Jimp } from 'jimp';
import path from 'path';

export async function processImageFile(inputFile: string, outputDir: string) {
	const outputFile = path.resolve(outputDir, path.basename(inputFile)) as `${string}.${string}`;

	console.info(`Cropping image: ${inputFile}`);

	try {
		const image = await Jimp.read(inputFile);
		const { width, height } = image.bitmap;
		const cropSize = Math.min(width, height, 900);
		const left = Math.floor((width - cropSize) / 2);
		const top = Math.floor((height - cropSize) / 2);

		const cropped = image.crop({ x: left, y: top, w: cropSize, h: cropSize });
		await cropped.write(outputFile);

		console.info(`\tDone: ${outputFile}`);
	} catch (err) {
		console.error(`\tError processing ${inputFile}: ${(err as Error).message}`);
	}
}
