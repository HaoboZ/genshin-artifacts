import fs from 'fs/promises';
import type { Stats } from 'node:fs';
import path from 'path';

export const SUPPORTED_EXTENSIONS = {
	video: ['.mp4'],
	image: ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif'],
} as const;

/** Strips shell-added quotes and normalizes trailing backslashes on Windows. */
function sanitizeInputPath(inputPath: string): string {
	let s = inputPath.trim();
	s = s.replace(/^["']|["']$/g, '').trim();
	// Trailing backslash can cause issues with shell quote handling (e.g. 'path\' in PowerShell)
	if (s.endsWith('\\') && s.length > 1) {
		s = s.slice(0, -1);
	}
	return s;
}

async function getPathStat(inputPath: string): Promise<Stats> {
	try {
		return await fs.stat(inputPath);
	} catch {
		console.error(`Error: ${inputPath} is not a valid file or directory.`);
		process.exit(1);
	}
}

async function globFiles(dir: string, extensions: readonly string[]): Promise<string[]> {
	const patterns = extensions.map((ext) => `*${ext}`);
	const results = await Promise.all(
		patterns.map((pattern) => Array.fromAsync(fs.glob(pattern, { cwd: dir }))),
	);
	return [...new Set(results.flat())];
}

export async function ensureOutputDir(outputPath: string): Promise<void> {
	const dir = path.extname(outputPath) ? path.dirname(outputPath) : outputPath;
	await fs.mkdir(path.resolve(process.cwd(), dir), { recursive: true });
}

export async function processPath(inputPath: string, extensions: readonly string[]) {
	const sanitized = sanitizeInputPath(inputPath);
	const stat = await getPathStat(sanitized);

	if (stat.isFile()) {
		const ext = path.extname(sanitized).toLowerCase();
		if (!extensions.includes(ext)) {
			console.error(`Error: ${sanitized} is not a supported file (${extensions.join(', ')}).`);
			process.exit(1);
		}
		return [sanitized];
	} else if (stat.isDirectory()) {
		const files = await globFiles(sanitized, extensions);

		if (files.length === 0) {
			console.info(`No supported files found in ${sanitized}`);
			return;
		}

		return files.map((file) => path.join(sanitized, file));
	}
}
