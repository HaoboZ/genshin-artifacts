import { spawn } from 'child_process';
import extract from 'extract-zip';
import fs from 'fs';
import fsAsync from 'fs/promises';
import path from 'path';
import { ensureOutputDir } from './utils';

const ffmpegName = 'ffmpeg.exe';
const ffprobeName = 'ffprobe.exe';

const FFMPEG_URL =
	'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip';

function getOutputFfmpegDir(): string {
	return path.join(process.cwd(), 'output/ffmpeg');
}

function getOutputPaths(): { ffmpeg: string; ffprobe: string } {
	const dir = getOutputFfmpegDir();
	return {
		ffmpeg: path.join(dir, ffmpegName),
		ffprobe: path.join(dir, ffprobeName),
	};
}

function checkFfmpegWorks(ffmpegPath: string): Promise<boolean> {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath, ['-version'], { stdio: 'pipe' });
		proc.on('close', (code) => resolve(code === 0));
		proc.on('error', () => resolve(false));
	});
}

async function downloadFfmpegToOutput(): Promise<{ ffmpeg: string; ffprobe: string }> {
	const outputDir = getOutputFfmpegDir();
	await ensureOutputDir('output/ffmpeg');

	const zipPath = path.join(outputDir, 'ffmpeg.zip');
	console.info('FFmpeg not found. Downloading to output/ffmpeg...');
	const res = await fetch(FFMPEG_URL);
	if (!res.ok) throw new Error(`Download failed: ${res.status}`);
	const buf = await res.arrayBuffer();
	await fsAsync.writeFile(zipPath, new Uint8Array(buf));
	console.info('Extracting...');

	await extract(zipPath, { dir: outputDir });

	const extractedDir = (await fsAsync.readdir(outputDir)).find((d) => d.startsWith('ffmpeg-'));
	if (!extractedDir) throw new Error('Unexpected zip structure');
	const binDir = path.join(outputDir, extractedDir, 'bin');
	const ffmpegExe = path.join(binDir, 'ffmpeg.exe');
	const ffprobeExe = path.join(binDir, 'ffprobe.exe');

	const { ffmpeg, ffprobe } = getOutputPaths();
	await fsAsync.copyFile(ffmpegExe, ffmpeg);
	await fsAsync.copyFile(ffprobeExe, ffprobe);

	await fsAsync.rm(path.join(outputDir, extractedDir), { recursive: true });
	await fsAsync.unlink(zipPath);

	console.info('FFmpeg ready at output/ffmpeg');
	return { ffmpeg, ffprobe };
}

/**
 * Resolves ffmpeg and ffprobe paths. Downloads to output/ffmpeg/ if not found.
 * Priority: output/ffmpeg/ → system PATH
 */
export async function getFfmpegPaths(): Promise<{ ffmpeg: string; ffprobe: string }> {
	// Check output/ffmpeg/ (downloaded on previous run)
	const outputPaths = getOutputPaths();
	if (fs.existsSync(outputPaths.ffmpeg) && fs.existsSync(outputPaths.ffprobe)) {
		return outputPaths;
	}

	// Check system PATH
	const pathWorks = await checkFfmpegWorks('ffmpeg');
	if (pathWorks) {
		return { ffmpeg: 'ffmpeg', ffprobe: 'ffprobe' };
	}

	// Download to output/ffmpeg
	return downloadFfmpegToOutput();
}
