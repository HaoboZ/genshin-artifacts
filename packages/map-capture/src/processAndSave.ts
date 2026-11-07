import fs from 'fs/promises';
import path from 'path';

import sharp, { type Sharp } from 'sharp';

export default async function processAndSave(image: Sharp, url: string) {
	await fs.mkdir(path.dirname(url), { recursive: true });
	image = await cropPixels(image, 1);
	image = await renderPng(image.trim());
	image = await cropPixels(image, 6);
	image = await renderPng(image);
	image = await renderPng(image.trim());
	await image.webp({ quality: 90, effort: 6 }).toFile(url);
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

async function renderPng(image: Sharp) {
	return sharp(await image.png().toBuffer());
}
