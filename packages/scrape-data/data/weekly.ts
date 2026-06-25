import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import fetchPage from '../fetchPage';
import { getImageUrl, required } from './helpers';

export async function fetchWeekly() {
	const dom = await fetchPage(
		'https://genshin-impact.fandom.com/wiki/Character_Level-Up_Material',
		{ waitForSelector: '.wikitable td[rowspan="3"]' },
	);

	const weekly = [];
	const characterWeeklyMaterials = {};
	const bosses = required(
		dom.window.document.getElementsByClassName('wikitable')[1],
		'weekly boss table',
	);
	for (const boss of bosses.querySelectorAll('td[rowspan="3"]')) {
		const matContainer = [
			boss.nextElementSibling,
			boss.parentElement?.nextElementSibling?.firstElementChild,
			boss.parentElement?.nextElementSibling?.nextElementSibling?.firstElementChild,
		];

		weekly.push({
			name: required(boss.querySelector('a'), 'weekly boss link').title.replace(
				' (Weekly Boss)',
				'',
			),
			items: matContainer.map((container) => {
				const materialContainer = required(container, 'weekly material container');
				const image = required(materialContainer.querySelector('img'), 'weekly material image');
				const key = pascalCase(image.alt.replace(/'/g, ''));
				const characterContainer = required(
					materialContainer.nextElementSibling,
					`${image.alt} character container`,
				);
				for (const character of characterContainer.querySelectorAll('a')) {
					characterWeeklyMaterials[character.title] = key;
				}

				return {
					key,
					name: image.alt,
					image: getImageUrl(image, `${image.alt} weekly material image`),
				};
			}),
		});
	}
	return { weekly, characterWeeklyMaterials };
}

export function writeWeekly(weekly) {
	writeFileSync('../next/public/data/weekly.json', `${JSON.stringify(weekly, null, '\t')}\n`);
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
