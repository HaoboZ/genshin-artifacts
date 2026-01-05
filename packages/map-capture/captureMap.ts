import fs from 'fs';
import path from 'path';
import { type Page } from 'playwright';
import { type Shot } from './types';
import { getCenterFromUrl, hardDrag } from './utils';

const OUTPUT_DIR = 'shots';

export default async function captureMap(
	page: Page,
	stepRatio = 0.75,
	saveToDisk = false,
): Promise<Shot[]> {
	// calculate step sizes based on viewport and ratio
	const viewport = page.viewportSize()!;
	const stepPx = viewport.width * stepRatio;
	const stepPy = viewport.height * stepRatio;

	console.info(`Using step sizes: ${stepPx}px x ${stepPy}px`);

	// create folder if saving
	if (saveToDisk) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	await hardDrag(page, 10000, 10000);

	const shots: Shot[] = [];
	const origin = getCenterFromUrl(page.url())!;
	let lastY = origin.y;
	let rowIndex = 0;

	while (true) {
		const rowShots: Shot[] = [];
		let lastX: number | null = null;
		let colIndex = 0;

		while (true) {
			const center = getCenterFromUrl(page.url());
			if (!center) break;

			if (lastX !== null && Math.abs(center.x - lastX) < 0.5) break;
			lastX = center.x;

			console.info(`col: ${colIndex}, row: ${rowIndex}`);

			const buffer = (await page.screenshot()) as Buffer;

			rowShots.push({
				buffer,
				centerX: center.x,
				centerY: center.y,
			});

			// save to disk if requested
			if (saveToDisk) {
				const filename = path.join(OUTPUT_DIR, `row${rowIndex}_col${colIndex}.png`);
				fs.writeFileSync(filename, buffer);
			}

			colIndex++;
			await hardDrag(page, -stepPx, 0);
		}

		shots.push(...rowShots);

		// move down one row and reset X
		await hardDrag(page, stepPx * rowShots.length, -stepPy);

		const newCenter = getCenterFromUrl(page.url());
		if (!newCenter || Math.abs(newCenter.y - lastY) < 0.5) break;
		lastY = newCenter.y;
		rowIndex++;
	}

	console.info(`Captured ${shots.length} shots in ${rowIndex + 1} rows`);

	return shots;
}
