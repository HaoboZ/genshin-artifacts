import axios from 'axios';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { mapToObj } from 'remeda';

export async function fetchElements() {
	const { data } = await axios.get('https://genshin-impact.fandom.com/wiki/Element');
	const dom = new JSDOM(data);

	const elementItems = dom.window.document.getElementsByClassName('wikia-gallery-item');
	return mapToObj(Array.from(elementItems), ({ children }) => [
		children[1].querySelector('a').text,
		children[0].querySelector('img').src.replace(/(\.png).*$/, '$1'),
	]);
}

export function writeElements(elements) {
	writeFileSync('../next/public/data/elements.json', `${JSON.stringify(elements, null, '\t')}\n`);
}
