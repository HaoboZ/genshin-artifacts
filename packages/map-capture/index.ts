import fs from 'fs';
import path from 'path';
import { chromium, type Page } from 'playwright';

const OUTPUT_DIR = 'shots';
const MAP_URL =
	'act.hoyolab.com/ys/app/interactive-map/index.html?lang=en-us#/map/2?shown_types=2,3,154,319,338,761,517,658,659,685,686,693';

// Tunables
const OVERLAP_RATIO = 0.15; // 15% overlap for stitching
const LOAD_DELAY = 400; // ms after network idle
const ZOOM_WHEEL = -6000; // adjust once manually if needed

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function removeUI(page: Page) {
	await page.evaluate(
		(classes) => {
			classes.forEach((cls) => {
				document.querySelectorAll(`.${cls}`).forEach((el) => el.remove());
			});
		},
		[
			'driver-popover',
			'driver-overlay',
			'mihoyo-cookie-tips',
			'filter-panel',
			'map-locations',
			'altitude-switch',
			'waypoint-switch',
			'mhy-map__action-btns',
			'bbs-qr',
			'leaflet-control-container',
		],
	);
}

async function setZoom(page: Page) {
	await page.mouse.wheel(0, ZOOM_WHEEL);
	await page.waitForTimeout(800);
}

async function drag(page: Page, dx: number, dy: number) {
	const vp = page.viewportSize()!;
	const cx = vp.width / 2;
	const cy = vp.height / 2;

	await page.mouse.move(cx, cy);
	await page.mouse.down();
	await page.mouse.move(cx + dx, cy + dy, { steps: 20 });
	await page.mouse.up();
}

async function waitForStable(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(LOAD_DELAY);
}

async function captureGrid(page: Page) {
	const vp = page.viewportSize()!;
	const stepX = vp.width * (1 - OVERLAP_RATIO);
	const stepY = vp.height * (1 - OVERLAP_RATIO);

	// You must tune these once visually
	const COLS = 10;
	const ROWS = 8;

	for (let row = 0; row < ROWS; row++) {
		for (let col = 0; col < COLS; col++) {
			await waitForStable(page);

			const filename = path.join(OUTPUT_DIR, `map_${row}_${col}.png`);

			await page.screenshot({
				path: filename,
			});

			console.log(`Captured ${filename}`);

			if (col < COLS - 1) {
				await drag(page, -stepX, 0);
			}
		}

		// Reset X and move down
		await drag(page, stepX * (COLS - 1), -stepY);
	}
}

(async () => {
	console.log('starting');
	const browser = await chromium.launch({
		headless: false, // MUST be false for debugging first
	});
	console.log('launched');

	const context = await browser.newContext({
		viewport: { width: 1920, height: 1080 },
		deviceScaleFactor: 2,
	});

	const page = await context.newPage();

	await page.goto(MAP_URL, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(5000); // allow map boot

	await removeUI(page);
	await setZoom(page);
	await captureGrid(page);

	await browser.close();
})();
