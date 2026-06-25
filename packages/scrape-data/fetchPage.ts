import { JSDOM } from 'jsdom';

type FetchPageOptions = {
	waitForSelector?: string;
};

function assertSelector(dom: JSDOM, url: string, selector?: string) {
	if (!selector || dom.window.document.querySelector(selector)) return;
	throw new Error(`Expected selector "${selector}" was not found on ${url}`);
}

function getFandomPageName(url: string) {
	const { hostname, pathname } = new URL(url);
	if (hostname !== 'genshin-impact.fandom.com' || !pathname.startsWith('/wiki/')) return;
	return decodeURIComponent(pathname.replace(/^\/wiki\//, ''));
}

async function fetchFandomParsedPage(url: string) {
	const pageName = getFandomPageName(url);
	if (!pageName) return;

	const apiUrl = new URL('https://genshin-impact.fandom.com/api.php');
	apiUrl.search = new URLSearchParams({
		action: 'parse',
		page: pageName,
		prop: 'text',
		format: 'json',
	}).toString();

	const response = await fetch(apiUrl);
	if (!response.ok) throw new Error(`Failed to fetch ${apiUrl}: HTTP ${response.status}`);

	const data = await response.json();
	const html = data?.parse?.text?.['*'];
	if (!html) throw new Error(`Missing parsed HTML for ${pageName}`);
	return new JSDOM(html);
}

export default async function fetchPage(url: string, options: FetchPageOptions = {}) {
	const fandomDom = await fetchFandomParsedPage(url);
	if (fandomDom) {
		assertSelector(fandomDom, url, options.waitForSelector);
		return fandomDom;
	}

	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);

	const html = await response.text();
	const dom = new JSDOM(html);
	assertSelector(dom, url, options.waitForSelector);
	return dom;
}
