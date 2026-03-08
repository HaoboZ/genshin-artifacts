import { spawn } from 'child_process';
import path from 'path';
import { ensureOutputDir } from './utils';

function parseTimeToSeconds(timemark: string): number {
	const parts = timemark.split(':');
	if (parts.length === 3) {
		const [h, m, s] = parts.map(Number);
		return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
	}
	if (parts.length === 2) {
		const [m, s] = parts.map(Number);
		return (m || 0) * 60 + (s || 0);
	}
	return 0;
}

export async function probeVideo(inputFile: string, ffprobePath: string): Promise<number | null> {
	return new Promise((resolve) => {
		const proc = spawn(
			ffprobePath,
			['-v', 'quiet', '-print_format', 'json', '-show_format', inputFile],
			{ stdio: ['ignore', 'pipe', 'ignore'] },
		);

		let stdout = '';
		proc.stdout?.on('data', (chunk) => (stdout += chunk));
		proc.on('close', (code) => {
			if (code !== 0) {
				console.warn(`Error probing with ffprobe: ${inputFile} (exit ${code})`);
				return resolve(null);
			}
			try {
				const metadata = JSON.parse(stdout) as { format?: { duration?: string | number } };
				const duration = metadata.format?.duration;
				if (typeof duration === 'number') return resolve(duration);
				if (duration !== null) {
					const parsed = Number(duration);
					return resolve(Number.isNaN(parsed) ? null : parsed);
				}
			} catch {
				console.warn(`Error parsing ffprobe output: ${inputFile}`);
			}
			resolve(null);
		});
	});
}

export async function processVideoFile(
	inputFile: string,
	outputDir: string,
	ffmpeg: string,
	ffprobe: string,
) {
	const outputFile = path.resolve(process.cwd(), outputDir, path.basename(inputFile));
	await ensureOutputDir(outputFile);

	const duration = await probeVideo(inputFile, ffprobe);

	console.info(
		`Converting video: ${inputFile} (${duration != null ? duration.toFixed(1) : '?'}s)`,
	);

	return new Promise<void>((resolve, reject) => {
		const proc = spawn(
			ffmpeg,
			[
				'-i',
				inputFile,
				'-vf',
				'scale=-2:720',
				'-c:v',
				'libx265',
				'-crf',
				'24',
				'-pix_fmt',
				'yuv420p',
				'-tag:v',
				'hvc1',
				'-movflags',
				'+faststart',
				'-c:a',
				'aac',
				'-b:a',
				'128k',
				'-y',
				outputFile,
			],
			{ stdio: ['ignore', 'ignore', 'pipe'] },
		);

		proc.stderr?.on('data', (chunk: Buffer) => {
			const line = chunk.toString();
			const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
			const fpsMatch = line.match(/fps=\s*(\d+)/);
			const sizeMatch = line.match(/size=\s*(\d+)KiB/);
			if (timeMatch) {
				const timemark = timeMatch[1];
				const fps = fpsMatch?.[1];
				const size = sizeMatch?.[1];
				const currentTime = parseTimeToSeconds(timemark);
				const percent =
					duration != null && duration > 0 ? (currentTime / duration) * 100 : null;
				process.stdout.write(
					`\r\t${timemark} | ${percent?.toFixed(1) ?? '?'}% | ${fps ?? '?'} fps | ${size ?? '?'} KiB`,
				);
			}
		});

		proc.on('close', (code) => {
			process.stdout.write('\n');
			if (code === 0) {
				resolve();
			} else {
				console.error(`\nError converting ${inputFile} (ffmpeg exit ${code})`);
				reject();
			}
		});

		proc.on('error', (err) => {
			console.error(`\nError spawning ffmpeg: ${err.message}`);
			reject();
		});
	});
}
