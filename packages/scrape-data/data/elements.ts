import { writeFileSync } from 'fs';
import { mapToObj } from 'remeda';
import fetchPage from '../fetchPage';
import { getImageUrl, required } from './helpers';

export async function fetchElements() {
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Element', {
		waitForSelector: '.wikia-gallery-item',
	});

	const elementItems = dom.window.document.getElementsByClassName('wikia-gallery-item');
	return mapToObj(Array.from(elementItems), ({ children }) => [
		required(children[1].querySelector('a'), 'element name link').text,
		getImageUrl(children[0].querySelector('img'), 'element image'),
	]);
}

export function writeElements(elements) {
	writeFileSync('../next/public/data/elements.json', `${JSON.stringify(elements, null, '\t')}\n`);
}
