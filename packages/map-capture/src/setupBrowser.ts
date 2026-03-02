import { chromium, type Page } from 'playwright';

export default async function setupBrowser(width: number, height: number) {
	const browser = await chromium.launch();
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();
	await page.goto(
		'https://act.hoyolab.com/ys/app/interactive-map/index.html?lang=en-us#/map/2?shown_types=2,3,154,319,338,761,517,658,659,685,686,693',
		{ waitUntil: 'domcontentloaded' },
	);

	await clickIfExists(page, 'button.mihoyo-cookie-tips__button >> text=OK');
	await clickIfExists(page, 'text=Skip tutorial');
	await clickIfExists(page, 'div.updatelog__close');
	await removeQueries(page, [
		'.filter-panel',
		'.map-locations',
		'.altitude-switch',
		'.waypoint-switch',
		'.mhy-map__action-btns',
		'.bbs-qr',
		'.leaflet-control-container',
	]);

	await page.mouse.wheel(0, -100);
	await page.waitForTimeout(500);

	return { browser, page };
}

async function clickIfExists(page: Page, selector: string) {
	try {
		const el = await page.waitForSelector(selector, { timeout: 10000 });
		if (el) await el.click();
	} catch {}
}

async function removeQueries(page: Page, queries: string[]) {
	await page.evaluate((queries) => {
		queries.forEach((q) => document.querySelectorAll(q).forEach((el) => el.remove()));
	}, queries);
}
