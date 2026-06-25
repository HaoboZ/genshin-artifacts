import { writeFileSync } from 'fs';
import fetchPage from '../fetchPage';
import { getImageUrl, required, requiredText } from './helpers';

const talentDays = {
	'Monday/Thursday': 1,
	'Tuesday/Friday': 2,
	'Wednesday/Saturday': 3,
};

export async function fetchTalents() {
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Character_Talent_Material', {
		waitForSelector: '.wikitable.alternating-colors-table tr',
	});

	const talents = [];
	const characterTalentMaterials = {};
	const nations = dom.window.document.getElementsByClassName('wikitable alternating-colors-table');
	for (const nation of nations) {
		const location = requiredText(
			nation.previousElementSibling?.previousElementSibling?.querySelector('span'),
			'talent material location',
		);
		for (const talent of nation.querySelectorAll('tr')) {
			const book = talent.querySelector('a');
			if (!book) continue;

			const name = requiredText(book, 'talent material book').split(' ')[0];
			const dayText = requiredText(talent.firstElementChild, `${name} talent material day`);
			talents.push({
				name,
				image: getImageUrl(talent.querySelector('.card-quality-4 img'), `${name} talent image`),
				location,
				day: required(talentDays[dayText], `${name} talent material day value`),
			});

			for (const character of talent.children[2].querySelectorAll('a')) {
				characterTalentMaterials[character.title] = name;
			}
		}
	}
	return { talents, characterTalentMaterials };
}

export function writeTalents(talents) {
	writeFileSync('../next/public/data/talents.json', `${JSON.stringify(talents, null, '\t')}\n`);
}
