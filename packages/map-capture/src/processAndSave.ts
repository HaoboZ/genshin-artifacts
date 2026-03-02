import fs from 'fs/promises';
import path from 'path';
import sharp, { type Sharp } from 'sharp';

export default async function processAndSave(image: Sharp, url: string) {
	await fs.mkdir(path.dirname(url), { recursive: true });
	image = await cropPixels(image, 1);
	image = sharp(await image.trim().toBuffer());
	image = await cropPixels(image, 6);
	image = sharp(await image.toBuffer());
	image = sharp(await image.trim().toBuffer());
	image = await halfSize(image);
	await image.png().toFile(url);
}

async function cropPixels(image: Sharp, pixels: number) {
	const { width, height } = await image.metadata();
	return image.extract({
		left: pixels,
		top: pixels,
		width: width - pixels * 2,
		height: height - pixels * 2,
	});
}

async function halfSize(image: Sharp) {
	const { width } = await image.metadata();
	return image.resize({ width: Math.floor(width / 2) });
}
