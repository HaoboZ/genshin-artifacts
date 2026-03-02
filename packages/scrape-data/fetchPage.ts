import { JSDOM } from 'jsdom';
import { chromium } from 'playwright';

export default async function fetchPage(url: string) {
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
	const html = await page.content();
	await browser.close();
	return new JSDOM(html);
}
