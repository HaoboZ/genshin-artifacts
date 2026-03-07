import fs from 'fs/promises';
import type { Stats } from 'node:fs';
import path from 'path';

export const SUPPORTED_EXTENSIONS = {
	video: ['.mp4'],
	image: ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif'],
} as const;

export async function getPathStat(inputPath: string): Promise<Stats> {
	try {
		return await fs.stat(inputPath);
	} catch {
		console.error(`Error: ${inputPath} is not a valid file or directory.`);
		process.exit(1);
	}
}

export async function globFiles(dir: string, extensions: readonly string[]): Promise<string[]> {
	const patterns = extensions.map((ext) => `*${ext}`);
	const results = await Promise.all(
		patterns.map((pattern) => Array.fromAsync(fs.glob(pattern, { cwd: dir }))),
	);
	return [...new Set(results.flat())];
}

export function resolveOutputPath(inputFile: string, inputPath: string, outputDir: string): string {
	const isFileInput = path.resolve(inputFile) === path.resolve(inputPath);
	const relativePath = isFileInput
		? path.basename(inputFile)
		: path.relative(inputPath, inputFile);
	return path.join(outputDir, relativePath);
}

export async function ensureOutputDir(outputFile: string): Promise<void> {
	await fs.mkdir(path.dirname(outputFile), { recursive: true });
}

export async function processPath(
	inputPath: string,
	outputDir: string,
	extensions: readonly string[],
	processFile: (inputFile: string, inputPath: string, outputDir: string) => Promise<void>,
) {
	const stat = await getPathStat(inputPath);

	if (stat.isFile()) {
		const ext = path.extname(inputPath).toLowerCase();
		if (!extensions.includes(ext)) {
			console.error(`Error: ${inputPath} is not a supported file (${extensions.join(', ')}).`);
			process.exit(1);
		}
		await processFile(inputPath, inputPath, outputDir);
	} else if (stat.isDirectory()) {
		const files = await globFiles(inputPath, extensions);

		if (files.length === 0) {
			console.info(`No supported files found in ${inputPath}`);
			return;
		}

		for (const file of files) {
			await processFile(path.join(inputPath, file), inputPath, outputDir);
		}
	}
}
