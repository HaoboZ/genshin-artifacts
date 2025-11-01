import axios from 'axios';
import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { indexBy, pick } from 'remeda';
import pget from '../next/src/helpers/pget';

export async function fetchCharacters() {
	const { data } = await axios.get('https://genshin-impact.fandom.com/wiki/Character/List');
	const dom = new JSDOM(data);

	const characters = [];
	for (const { children } of dom.window.document.querySelector('.mw-parser-output tbody')
		.children) {
		const character = children[1].querySelector('a');
		if (!character) continue;

		if (character.title === 'Wonderland Manekin') {
			character.title = 'Manekin';
		}

		const characterData = {
			key: pascalCase(character.title),
			name: character.title,
			rarity: +children[2].querySelector('img').alt[0],
			weaponType: children[4].querySelector('a').title,
			element: children[3].querySelector('a')?.title ?? 'None',
			image: children[0]
				.querySelector('img')
				.getAttribute('data-src')
				.replace(/(\.png).*$/, '$1'),
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
		'../next/app/api/characters.json',
		`${JSON.stringify(indexBy(characters, pget('key')), null, '\t')}\n`,
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
