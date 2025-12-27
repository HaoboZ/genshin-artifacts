import type { Page } from 'playwright';

export function getCenterFromUrl(url: string) {
	const m = url.match(/center=([-0-9.]+),([-0-9.]+)/);
	if (!m) return null;
	return { x: parseFloat(m[2]), y: parseFloat(m[1]) };
}

export async function hardDrag(page: Page, dx: number, dy: number) {
	const vp = page.viewportSize()!;
	const x = Math.floor(vp.width / 2);
	const y = Math.floor(vp.height / 2);

	await page.mouse.move(x, y);
	await page.mouse.down();

	await page.mouse.move(x + dx, y + dy, { steps: 1 });
	await page.mouse.up();

	await page.waitForTimeout(1000);
}
