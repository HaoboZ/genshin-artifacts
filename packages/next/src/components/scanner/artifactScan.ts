import { createWorker, PSM } from 'tesseract.js';
import type { IArtifact } from '@/types/good';
import { detectArtifactFlags } from './flags';
import { createCanvasCrop, getImageDimensions, getPanelCropCandidates } from './image';
import { parseArtifactText, parseSubstats } from './parser';
import { findArtifactPanelAnchor } from './panel';
import type { OcrBlocks, PanelRectangle } from './types';
import { detectArtifactRarity } from './rarity';

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;
type ArtifactInput = File | Blob | HTMLCanvasElement;
let workerPromise: Promise<OcrWorker> | undefined;
let extractionQueue: Promise<void> = Promise.resolve();

export async function extractArtifact(file: ArtifactInput) {
	return withWorker((worker) => readArtifact(worker, file));
}

/** Read selected images sequentially while reusing one OCR worker. */
export async function extractArtifacts(files: Iterable<File>) {
	return withWorker(async (worker) => {
		const artifacts: Partial<IArtifact>[] = [];
		for (const file of files) artifacts.push(await readArtifact(worker, file));
		return artifacts;
	});
}

function withWorker<T>(operation: (worker: OcrWorker) => Promise<T>) {
	const result = extractionQueue.then(async () => operation(await getWorker()));
	extractionQueue = result.then(
		() => undefined,
		() => undefined,
	);
	return result;
}

function getWorker() {
	if (!workerPromise) {
		workerPromise = createWorker('eng').catch((error) => {
			workerPromise = undefined;
			throw error;
		});
	}
	return workerPromise;
}

export async function closeArtifactScanner() {
	await extractionQueue;
	const worker = await workerPromise?.catch(() => undefined);
	workerPromise = undefined;
	await worker?.terminate();
}

async function readArtifact(worker: OcrWorker, file: ArtifactInput) {
	const { width, height } = await getImageDimensions(file);
	const failures: string[] = [];
	let supplementalSetText: string | undefined;
	const crops = getPanelCropCandidates(width, height);

	for (const rectangle of crops) {
		try {
			const sparsePage = await recognize(worker, file, rectangle, PSM.SPARSE_TEXT);
			let artifact: Partial<IArtifact>;
			try {
				artifact = parseArtifactText(sparsePage.data.text);
			} catch (error) {
				if (rectangle.left === 0 && rectangle.width === width && !supplementalSetText)
					supplementalSetText = await recognizeSetHeading(worker, file, width, height);
				if (!supplementalSetText) throw error;
				try {
					artifact = parseArtifactText(`${sparsePage.data.text}\n${supplementalSetText}`);
				} catch {
					throw error;
				}
			}
			const anchor = findArtifactPanelAnchor(sparsePage.data);
			const preciseLevel = await recognizeArtifactLevel(worker, file, anchor, width, height);
			const fullPage = await recognize(worker, file, rectangle, PSM.AUTO);
			const supplementalStats =
				artifact.unactivatedSubstats.length === 0
					? await recognizeSupplementalStats(worker, file, rectangle, anchor, height, artifact)
					: [];
			const combinedOcr: OcrBlocks = {
				blocks: [...(sparsePage.data.blocks ?? []), ...(fullPage.data.blocks ?? [])],
			};
			const flags = await detectArtifactFlags(file, combinedOcr);
			const rarity = await detectArtifactRarity(
				file,
				sparsePage.data,
				artifact.rarity,
				width,
				height,
			);
			return combineResults(
				artifact,
				fullPage.data.text,
				preciseLevel,
				supplementalStats,
				rarity,
				flags,
			);
		} catch (error) {
			failures.push(
				`Crop ${JSON.stringify(rectangle)}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	throw new Error(
		`Could not read an artifact from any cropped region. Tried ${failures.length} crops.\n${failures.join('\n---\n')}`,
	);
}

async function recognizeSetHeading(
	worker: OcrWorker,
	file: ArtifactInput,
	width: number,
	height: number,
) {
	const top = Math.floor(height * 0.52);
	const crop: PanelRectangle = {
		left: 0,
		top,
		width,
		height: Math.min(Math.floor(height * 0.15), height - top),
	};
	const enhanced = await createCanvasCrop(file, crop, 2, true);
	await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
	const page = await worker.recognize(enhanced ?? file, enhanced ? {} : { rectangle: crop });
	return page.data.text;
}

async function recognize(
	worker: OcrWorker,
	image: ArtifactInput,
	rectangle: PanelRectangle,
	pageSegmentation: PSM,
) {
	await worker.setParameters({ tessedit_pageseg_mode: pageSegmentation });
	return worker.recognize(image, { rectangle }, { blocks: true });
}

async function recognizeSupplementalStats(
	worker: OcrWorker,
	file: ArtifactInput,
	panel: PanelRectangle,
	anchor: ReturnType<typeof findArtifactPanelAnchor>,
	imageHeight: number,
	artifact: Partial<IArtifact>,
) {
	const top = anchor
		? Math.max(0, Math.floor(anchor.line.bbox.y1 + imageHeight * 0.2))
		: Math.floor(imageHeight * 0.4);
	const crop: PanelRectangle = {
		left: panel.left,
		top,
		width: panel.width,
		height: Math.min(Math.floor(imageHeight * 0.25), imageHeight - top),
	};
	const enhanced = await createCanvasCrop(file, crop, 2);
	await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
	const page = await worker.recognize(enhanced ?? file, enhanced ? {} : { rectangle: crop }, {
		blocks: true,
	});
	const parseUnactivated = (text: string) =>
		parseSubstats(
			text
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter(Boolean),
			artifact.mainStatKey,
			true,
		).map(({ key, value }) => ({ key, value }));
	const highResolutionStats = parseUnactivated(page.data.text);
	if (highResolutionStats.length > 0) return highResolutionStats;

	// Faded unactivated text can disappear at normal contrast. The thresholded
	// pass is less precise for digits, so use it only when the enlarged pass finds
	// no unactivated stat at all.
	const thresholded = await createCanvasCrop(file, crop, 1, true);
	const fallback = await worker.recognize(
		thresholded ?? file,
		thresholded ? {} : { rectangle: crop },
		{ blocks: true },
	);
	return parseUnactivated(fallback.data.text);
}

async function recognizeArtifactLevel(
	worker: OcrWorker,
	file: ArtifactInput,
	anchor: ReturnType<typeof findArtifactPanelAnchor>,
	width: number,
	height: number,
) {
	if (!anchor) return undefined;
	const wideLayout = width / height >= 1.5;
	const levelOffset = wideLayout ? width * 0.105 : height * 0.22;
	const levelHeight = wideLayout ? width * 0.03 : height * 0.06;
	const crop: PanelRectangle = {
		left: Math.max(0, Math.floor(anchor.word.bbox.x0 - width * 0.02)),
		top: Math.max(0, Math.floor(anchor.line.bbox.y1 + levelOffset)),
		width: Math.min(Math.floor(width * 0.28), width - anchor.word.bbox.x0),
		height: Math.min(Math.floor(levelHeight), height - anchor.line.bbox.y1),
	};
	const image = await createCanvasCrop(file, crop, 2);
	if (!image) return undefined;
	await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
	const { data } = await worker.recognize(image);
	return [...data.text.matchAll(/[+\uFF0B]\s*(\d{1,2})(?![\d.,])/g)]
		.map((match) => Number(match[1]))
		.find((level) => level === 0 || (level >= 4 && level <= 20 && level % 4 === 0));
}

function combineResults(
	artifact: Partial<IArtifact>,
	alternateText: string,
	preciseLevel: number | undefined,
	supplementalStats: IArtifact['unactivatedSubstats'],
	rarity: number,
	flags: Pick<IArtifact, 'lock' | 'astralMark'>,
): Partial<IArtifact> {
	let alternate: Partial<IArtifact> | undefined;
	try {
		alternate = parseArtifactText(alternateText);
	} catch {
		// Keep the sparse-layout result when standard segmentation is noisier.
	}
	const selected = alternate?.mainStatKey.endsWith('_dmg_') ? alternate : artifact;
	return {
		...selected,
		rarity,
		level: Math.max(selected.level, alternate?.level ?? 0, preciseLevel ?? 0),
		unactivatedSubstats:
			selected.unactivatedSubstats.length > 0
				? selected.unactivatedSubstats
				: alternate?.unactivatedSubstats.length
					? alternate.unactivatedSubstats
					: supplementalStats,
		...flags,
	};
}
