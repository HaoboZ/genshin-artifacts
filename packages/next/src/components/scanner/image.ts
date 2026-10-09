import type { PanelRectangle } from './types';

type ImageInput = File | Blob | HTMLCanvasElement | Uint8Array;
type LoadedCanvasImage = {
	source: CanvasImageSource;
	width: number;
	height: number;
	close: () => void;
};

async function loadCanvasImage(image: ImageInput): Promise<LoadedCanvasImage> {
	if (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement)
		return { source: image, width: image.width, height: image.height, close: () => {} };
	const bitmap = await createImageBitmap(image as Blob);
	return {
		source: bitmap,
		width: bitmap.width,
		height: bitmap.height,
		close: () => bitmap.close(),
	};
}

export async function createCanvasSurface(
	width: number,
	height: number,
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

export async function serializeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not encode cropped image.'))),
			'image/png',
		),
	);
}

export async function getImageDimensions(
	image: ImageInput,
): Promise<{ width: number; height: number }> {
	if (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement)
		return { width: image.width, height: image.height };
	if (image instanceof Uint8Array && image.length >= 24) {
		const view = new DataView(image.buffer, image.byteOffset, image.byteLength);
		if (view.getUint32(0) === 0x89504e47)
			return { width: view.getUint32(16), height: view.getUint32(20) };
	}
	const bitmap = await loadCanvasImage(image);
	try {
		return { width: bitmap.width, height: bitmap.height };
	} finally {
		bitmap.close();
	}
}

export function getPanelCropCandidates(width: number, height: number): PanelRectangle[] {
	if (width / height >= 1.15) {
		return [0.47, 0.5, 0.53, 0.57, 0.63, 0.67, 0.7].map((leftRatio) => {
			const left = Math.floor(width * leftRatio);
			return { left, top: 0, width: width - left, height };
		});
	}

	const aspectRatio = width / height;
	const leftRatios =
		aspectRatio < 0.75
			? [0.1, 0.15, 0, 0.5]
			: aspectRatio < 0.87
				? [0.15, 0.3, 0, 0.5]
				: [0.3, 0.15, 0, 0.5];
	return leftRatios.map((leftRatio) => {
		const left = Math.floor(width * leftRatio);
		return { left, top: 0, width: width - left, height };
	});
}

export async function createCanvasCrop(
	file: ImageInput,
	rectangle: PanelRectangle,
	scale = 1,
	threshold = false,
): Promise<Blob | undefined> {
	const bitmap = await loadCanvasImage(file);
	try {
		const canvas = await createCanvasSurface(rectangle.width * scale, rectangle.height * scale);
		canvas.width = rectangle.width * scale;
		canvas.height = rectangle.height * scale;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return undefined;
		context.imageSmoothingEnabled = false;
		context.drawImage(
			bitmap.source,
			rectangle.left,
			rectangle.top,
			rectangle.width,
			rectangle.height,
			0,
			0,
			canvas.width,
			canvas.height,
		);
		if (threshold) {
			const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
			for (let offset = 0; offset < pixels.data.length; offset += 4) {
				const luminance =
					pixels.data[offset] * 0.299 +
					pixels.data[offset + 1] * 0.587 +
					pixels.data[offset + 2] * 0.114;
				const value = luminance > 170 ? 255 : 0;
				pixels.data[offset] = value;
				pixels.data[offset + 1] = value;
				pixels.data[offset + 2] = value;
				pixels.data[offset + 3] = 255;
			}
			context.putImageData(pixels, 0, 0);
		}
		return await serializeCanvas(canvas);
	} finally {
		bitmap.close();
	}
}
