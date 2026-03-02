import ffmpeg from 'fluent-ffmpeg';
import { ensureOutputDir, processPath, resolveOutputPath, SUPPORTED_EXTENSIONS } from './utils';

const [, , ...args] = process.argv;

if (args.length === 0) {
	console.log('Usage: node index.ts <file.mp4 | directory>');
	process.exit(1);
}

const OUTPUT_DIR = 'output/video';
await processPath(args[0], OUTPUT_DIR, SUPPORTED_EXTENSIONS.video, processVideoFile);
console.log(`\nConversion complete. Files saved in ${OUTPUT_DIR}.`);

async function processVideoFile(inputFile: string, inputPath: string, outputDir: string) {
	const outputFile = resolveOutputPath(inputFile, inputPath, outputDir);
	await ensureOutputDir(outputFile);

	console.log(`Converting video: ${inputFile} -> ${outputFile}`);

	return new Promise<void>((resolve) => {
		ffmpeg(inputFile)
			.videoFilter('scale=-2:720')
			.videoCodec('libx265')
			.outputOptions(['-crf 24', '-pix_fmt yuv420p', '-tag:v hvc1', '-movflags +faststart'])
			.audioCodec('aac')
			.audioBitrate('128k')
			.output(outputFile)
			.on('start', (cmd) => console.log('ffmpeg command:', cmd))
			.on('progress', (progress) => {
				process.stdout.write(
					`\r  ${progress.timemark} | ${progress.percent?.toFixed(1) ?? '?'}% | ${progress.currentFps} fps | ${progress.targetSize} KB`,
				);
			})
			.on('end', () => {
				process.stdout.write('\n');
				resolve();
			})
			.on('error', (err) => {
				console.error(`\nError converting ${inputFile}: ${err.message}`);
				resolve();
			})
			.run();
	});
}
