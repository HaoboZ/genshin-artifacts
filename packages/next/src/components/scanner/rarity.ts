import { findArtifactPanelAnchor } from './panel';
import type { OcrBlocks } from './types';

export async function detectArtifactRarity(
	file: File | Blob | HTMLCanvasElement,
	ocr: OcrBlocks,
	fallback: number,
	width: number,
	height: number,
) {
	const anchor = findArtifactPanelAnchor(ocr);
	if (!anchor || typeof document === 'undefined' || typeof createImageBitmap === 'undefined')
		return fallback;
	const bitmap = file instanceof HTMLCanvasElement ? file : await createImageBitmap(file);
	try {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return fallback;
		context.drawImage(bitmap, 0, 0);
		const image = context.getImageData(0, 0, width, height);
		const centerY = Math.round(anchor.line.bbox.y1 + width * 0.08);
		const left = Math.max(0, Math.round(anchor.word.bbox.x0));
		const right = Math.min(width, Math.round(left + width * 0.105));
		const band = Math.max(4, Math.round(width * 0.006));
		const columns: boolean[] = [];
		for (let x = left; x < right; x += 1) {
			let goldPixels = 0;
			for (
				let y = Math.max(0, centerY - band);
				y <= Math.min(height - 1, centerY + band);
				y += 1
			) {
				const offset = (y * width + x) * 4;
				const red = image.data[offset];
				const green = image.data[offset + 1];
				const blue = image.data[offset + 2];
				if (red > 185 && green > 125 && green < 225 && blue < 125) goldPixels += 1;
			}
			columns.push(goldPixels >= 2);
		}
		let count = 0;
		let run = 0;
		for (let index = 0; index <= columns.length; index += 1) {
			if (index < columns.length && columns[index]) run += 1;
			else {
				if (run >= width * 0.006) count += 1;
				run = 0;
			}
		}
		return count >= 1 && count <= 5 ? count : fallback;
	} finally {
		if (bitmap instanceof ImageBitmap) bitmap.close();
	}
}
