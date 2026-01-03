import sharp from 'sharp';

export default async function processAndSave(buffer: Buffer<ArrayBufferLike>, url: string) {
	buffer = await cropPixels(buffer, 1);
	buffer = await sharp(buffer).trim().toBuffer();
	buffer = await cropPixels(buffer, 6);
	buffer = await sharp(buffer).trim().toBuffer();
	buffer = await halfSize(buffer);
	await sharp(buffer).png().toFile(url);
}

async function cropPixels(buffer: Buffer<ArrayBufferLike>, pixels: number) {
	const image = sharp(buffer);
	const { width, height } = await image.metadata();

	return await image
		.extract({
			left: pixels,
			top: pixels,
			width: width - pixels * 2,
			height: height - pixels * 2,
		})
		.toBuffer();
}

async function halfSize(buffer: Buffer<ArrayBufferLike>) {
	const image = sharp(buffer);
	const { width } = await image.metadata();

	return await image.resize({ width: Math.floor(width / 2) }).toBuffer();
}
