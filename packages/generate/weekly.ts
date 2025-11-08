import axios from 'axios';
import { pascalCase } from 'change-case';
import { writeFileSync, readFileSync } from 'fs';
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
				const key = pascalCase(image.alt.replace(/'/g, ''));
				if (characters) {
					for (const character of container.nextElementSibling.querySelectorAll('a')) {
						const found = characters.find(({ name }) => name === character.title);
						if (found) found.weeklyMaterial = key;
					}
				}

				return {
					key,
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
	const entries = weekly.flatMap(({ items }) =>
		items.map(({ name, key }) => `\n\t| '${key}' // ${name}`),
	);

	// Add semicolon to the last union entry
	entries[entries.length - 1] = entries[entries.length - 1].replace(/^(\n\t\| '[^']+')/, '$1;');

	writeFileSync(
		'../next/src/types/materials.d.ts',
		`export type MaterialKey =${entries.join('')}\n`,
	);
}
