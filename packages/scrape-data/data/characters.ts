import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { indexBy, pick, prop } from 'remeda';
import fetchPage from '../fetchPage';
import { getImageUrl, required } from './helpers';

export async function fetchCharacters() {
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Character/List', {
		waitForSelector: '.mw-parser-output tbody tr',
	});

	const characters = [];
	for (const { children } of required(
		dom.window.document.querySelector('.mw-parser-output tbody'),
		'character table body',
	).children) {
		const character = children[1].querySelector('a');
		if (!character) continue;

		if (character.title === 'Wonderland Manekin') character.title = 'Manekin';

		const characterData = {
			key: pascalCase(character.title),
			name: character.title,
			rarity: +required(children[2].querySelector('img'), `${character.title} rarity image`)
				.alt[0],
			weaponType: required(children[4].querySelector('a'), `${character.title} weapon link`)
				.title,
			element: children[3].querySelector('a')?.title ?? 'None',
			image: getImageUrl(children[0].querySelector('img'), `${character.title} image`),
		};

		if (characterData.name === 'Manekin') {
			characterData.image =
				'https://static.wikia.nocookie.net/gensin-impact/images/8/8e/Manekin_Icon.png';
			characters.push({
				key: 'Manekina',
				name: 'Manekina',
				...pick(characterData, ['rarity', 'weaponType', 'element']),
				image: 'https://static.wikia.nocookie.net/gensin-impact/images/f/f2/Manekina_Icon.png',
			});
		}

		characters.push(characterData);
	}

	return characters;
}

export function writeCharacters(characters: any[]) {
	writeFileSync(
		'../next/public/data/characters.json',
		`${JSON.stringify(indexBy(characters, prop('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'../next/src/types/character.d.ts',
		`export type CharacterKey =${characters
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${characters.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}
