import { writeFileSync } from 'fs';
import { mapToObj } from 'remeda';
import fetchPage from '../fetchPage';

export async function fetchElements() {
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Element');

	const elementItems = dom.window.document.getElementsByClassName('wikia-gallery-item');
	return mapToObj(Array.from(elementItems), ({ children }) => [
		children[1].querySelector('a').text,
		children[0].querySelector('img').src.replace(/(\.png).*$/, '$1'),
	]);
}

export function writeElements(elements) {
	writeFileSync('../next/public/data/elements.json', `${JSON.stringify(elements, null, '\t')}\n`);
}
