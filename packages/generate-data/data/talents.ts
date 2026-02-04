import { writeFileSync } from 'fs';
import fetchPage from '../fetchPage';

export async function fetchTalents(characters) {
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Character_Talent_Material');

	const talents = [];
	const nations = dom.window.document.getElementsByClassName('wikitable alternating-colors-table');
	for (const nation of nations) {
		const location =
			nation.previousElementSibling.previousElementSibling.querySelector('span').textContent;
		for (const talent of nation.querySelectorAll('tr')) {
			const book = talent.querySelector('a');
			if (!book) continue;

			const name = book.textContent.split(' ')[0];
			talents.push({
				name,
				image: talent
					.querySelector('.card-quality-4 img')
					.getAttribute('data-src')
					.replace(/(\.png).*$/, '$1'),
				location,
				day: { 'Monday/Thursday': 1, 'Tuesday/Friday': 2, 'Wednesday/Saturday': 3 }[
					talent.firstElementChild.textContent
				],
			});

			if (characters) {
				for (const character of talent.children[2].querySelectorAll('a')) {
					const found = characters.find(({ name }) => name === character.title);
					if (found) found.talentMaterial = name;
				}
			}
		}
	}
	return talents;
}

export function writeTalents(talents) {
	writeFileSync('../next/public/data/talents.json', `${JSON.stringify(talents, null, '\t')}\n`);
}
