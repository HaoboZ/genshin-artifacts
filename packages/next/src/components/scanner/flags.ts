import type { IArtifact } from '@/types/good';
import { findArtifactPanelAnchor, getOcrLines } from './panel';
import type { OcrBlocks, OcrWord } from './types';

type ArtifactFlags = Pick<IArtifact, 'lock' | 'astralMark'>;

export async function detectArtifactFlags(file: File | Blob | HTMLCanvasElement, ocr: OcrBlocks) {
	const defaults: ArtifactFlags = { lock: false, astralMark: false };
	const lines = getOcrLines(ocr);
	const panelAnchor = findArtifactPanelAnchor(ocr);
	const words = lines.flatMap((line) => line.words);
	const levelWords = words.filter((word) => /^(?:[+\uFF0B]\s*0|a0|ao)$/i.test(word.text.trim()));
	const detectedLevelWord = panelAnchor
		? levelWords
				.filter(
					(word) =>
						word.bbox.y0 >= panelAnchor.line.bbox.y1 &&
						word.bbox.x0 >= panelAnchor.word.bbox.x0 - 20,
				)
				.sort((a, b) => a.bbox.y0 - b.bbox.y0)[0]
		: levelWords[0];
	const anchorLevelY = panelAnchor ? panelAnchor.line.bbox.y1 + 235 : 0;
	const levelWord: OcrWord | undefined = detectedLevelWord
		? panelAnchor && !/^\+\s*0$/i.test(detectedLevelWord.text.trim())
			? {
					...detectedLevelWord,
					bbox: {
						...detectedLevelWord.bbox,
						x0: panelAnchor.word.bbox.x0,
						x1: panelAnchor.word.bbox.x1,
					},
				}
			: detectedLevelWord
		: panelAnchor
			? {
					text: '+0',
					bbox: {
						x0: panelAnchor.word.bbox.x0,
						x1: panelAnchor.word.bbox.x1,
						y0: anchorLevelY - 10,
						y1: anchorLevelY + 10,
					},
				}
			: undefined;
	if (!levelWord || typeof document === 'undefined' || typeof createImageBitmap === 'undefined')
		return defaults;

	const bitmap = file instanceof HTMLCanvasElement ? file : await createImageBitmap(file);
	try {
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return defaults;
		context.drawImage(bitmap, 0, 0);
		const image = context.getImageData(0, 0, bitmap.width, bitmap.height);
		const centerY = (levelWord.bbox.y0 + levelWord.bbox.y1) / 2;
		const radiusX = Math.max(7, Math.round(bitmap.width * 0.012));
		const radiusY = Math.max(7, Math.round(bitmap.width * 0.016));
		const countColor = (
			xOffset: number,
			isColor: (red: number, green: number, blue: number) => boolean,
		): number => {
			const centerX = Math.round(levelWord.bbox.x1 + xOffset);
			let count = 0;
			for (
				let y = Math.max(0, Math.round(centerY - radiusY));
				y < Math.min(bitmap.height, centerY + radiusY);
				y += 1
			) {
				for (
					let x = Math.max(0, centerX - radiusX);
					x < Math.min(bitmap.width, centerX + radiusX);
					x += 1
				) {
					const offset = (y * bitmap.width + x) * 4;
					if (isColor(image.data[offset], image.data[offset + 1], image.data[offset + 2]))
						count += 1;
				}
			}
			return count;
		};
		return {
			lock: countColor(285, (red, green, blue) => red > 150 && green < 130 && blue < 130) > 8,
			astralMark:
				countColor(342, (red, green, blue) => red > 190 && green > 125 && blue < 110) > 8,
		};
	} finally {
		if (bitmap instanceof ImageBitmap) bitmap.close();
	}
}
