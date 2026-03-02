import { type Page } from 'playwright';
import { getCenterFromUrl, hardDrag } from './utils';

export default async function measureUnits(page: Page, stepRatio = 0.75) {
	await hardDrag(page, 10000, 10000);
	const viewport = page.viewportSize()!;
	const stepPx = viewport.width * stepRatio;
	const stepPy = viewport.height * stepRatio;

	// Measure X direction
	const beforeX = getCenterFromUrl(page.url())!;
	await hardDrag(page, -stepPx, 0);
	const afterX = getCenterFromUrl(page.url())!;
	const unitsPerPixelX = Math.abs(afterX.x - beforeX.x) / stepPx;

	// Measure Y direction
	await hardDrag(page, 0, -stepPy);
	const afterY = getCenterFromUrl(page.url())!;
	const unitsPerPixelY = Math.abs(afterY.y - afterX.y) / stepPy;

	console.info(
		`Units per pixel - X: ${unitsPerPixelX.toFixed(6)}, Y: ${unitsPerPixelY.toFixed(6)}`,
	);

	// Reset position
	await hardDrag(page, stepPx, stepPy);

	return { unitsPerPixelX, unitsPerPixelY };
}
