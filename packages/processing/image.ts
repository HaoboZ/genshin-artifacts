import sharp from 'sharp';
import { ensureOutputDir, processPath, resolveOutputPath, SUPPORTED_EXTENSIONS } from './utils';

const [, , ...args] = process.argv;

if (args.length === 0) {
	console.info('Usage: node index.ts <image file | directory>');
	process.exit(1);
}

const OUTPUT_DIR = 'output/image';
await processPath(args.join(' '), OUTPUT_DIR, SUPPORTED_EXTENSIONS.image, processImageFile);
console.info(`\nCropping complete. Files saved in ${OUTPUT_DIR}.`);

async function processImageFile(inputFile: string, inputPath: string, outputDir: string) {
	const outputFile = resolveOutputPath(inputFile, inputPath, outputDir);
	await ensureOutputDir(outputFile);

	console.info(`Cropping image: ${inputFile} -> ${outputFile}`);

	try {
		const image = sharp(inputFile);
		const metadata = await image.metadata();
		const { width = 0, height = 0 } = metadata;
		const cropSize = Math.min(width, height, 900);
		const left = Math.floor((width - cropSize) / 2);
		const top = Math.floor((height - cropSize) / 2);

		await image
			.extract({ left, top, width: cropSize, height: cropSize })
			.png()
			.toFile(outputFile);

		console.info(`  Done: ${outputFile}`);
	} catch (err) {
		console.error(`  Error processing ${inputFile}: ${(err as Error).message}`);
	}
}
