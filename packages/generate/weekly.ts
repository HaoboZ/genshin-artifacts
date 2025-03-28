import axios from 'axios';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

export async function fetchWeekly(characters) {
	const { data } = await axios.get(
		'https://genshin-impact.fandom.com/wiki/Character_Level-Up_Material',
	);
	const dom = new JSDOM(data);

	const weekly = [];
	const bosses = dom.window.document.getElementsByClassName('wikitable')[1];

	for (const boss of bosses.querySelectorAll('td[rowspan="3"]')) {
		const matContainer = [
			boss.nextElementSibling,
			boss.parentElement.nextElementSibling.firstElementChild,
			boss.parentElement.nextElementSibling.nextElementSibling.firstElementChild,
		];

		weekly.push({
			name: boss.querySelector('a').title.replace(' (Weekly Boss)', ''),
			items: matContainer.map((container) => {
				const image = container.querySelector('img');

				if (characters) {
					for (const character of container.nextElementSibling.querySelectorAll('a')) {
						const found = characters.find(({ name }) => name === character.title);
						if (found) found.weeklyMaterial = image.alt;
					}
				}

				return {
					name: image.alt,
					image: image.getAttribute('data-src').replace(/(\.png).*$/, '$1'),
				};
			}),
		});
	}
	return weekly;
}

export function writeWeekly(weekly) {
	writeFileSync('../next/app/api/weekly.json', `${JSON.stringify(weekly, null, '\t')}\n`);
}
