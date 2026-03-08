import { getFfmpegPaths } from './ffmpeg';
import { processImageFile } from './image';
import { ensureOutputDir, processPath, SUPPORTED_EXTENSIONS } from './utils';
import { probeVideo, processVideoFile } from './video';

const [, , action, ...rest] = process.argv;

const usage = `Usage: processing.exe <action> [options] <path>
\tprocessing.exe image <path>   \t\tRun image processing
\tprocessing.exe video <path>   \t\tRun video processing
\tprocessing.exe video -s <path>\t\tRun ffprobe only (no output)
`;

if (!action || rest.length === 0) {
	console.info(usage);
	process.exit(1);
}

switch (action) {
	case 'image': {
		const path = rest.join(' ');
		const files = await processPath(path, SUPPORTED_EXTENSIONS.image);
		await ensureOutputDir('output/image');
		for (const file of files) {
			await processImageFile(file, 'output/image');
		}
		break;
	}
	case 'video': {
		const isProbeOnly = rest[0] === '-s';
		const path = isProbeOnly ? rest.slice(1).join(' ') : rest.join(' ');
		if (!path) {
			console.info(usage);
			process.exit(1);
		}
		const files = await processPath(path, SUPPORTED_EXTENSIONS.video);
		const { ffmpeg, ffprobe } = await getFfmpegPaths();
		if (isProbeOnly) {
			for (const file of files) {
				const duration = await probeVideo(file, ffprobe);
				console.info(`${file}: ${duration != null ? duration.toFixed(1) : '?'}s`);
			}
		} else {
			await ensureOutputDir('output/video');
			for (const file of files) {
				await processVideoFile(file, 'output/video', ffmpeg, ffprobe);
			}
		}
		break;
	}
	default:
		console.info(usage);
		process.exit(1);
}
