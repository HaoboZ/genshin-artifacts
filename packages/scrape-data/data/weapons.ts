import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { indexBy, prop } from 'remeda';
import fetchPage from '../fetchPage';
import { getImageUrl, required, requiredText } from './helpers';

export async function fetchWeapons() {
	const dom = await fetchPage(
		'https://genshin-impact.fandom.com/wiki/Weapon/List/By_Weapon_Type',
		{
			waitForSelector: '.article-table tr',
		},
	);

	const weapons = [];
	for (const weaponTypeTable of dom.window.document.querySelectorAll('.article-table')) {
		const weaponType = required(
			weaponTypeTable.previousElementSibling?.querySelector('a'),
			'weapon type heading link',
		).title;
		for (const { children } of weaponTypeTable.querySelectorAll('tr')) {
			const name = children[1].querySelector('a')?.textContent;
			if (!name) continue;

			if (children[5].children.length) children[5].removeChild(children[5].firstElementChild);
			weapons.push({
				key: pascalCase(name.replaceAll("'", '')),
				name,
				image: getImageUrl(children[0].querySelector('img'), `${name} image`),
				rarity: +required(children[2].querySelector('img'), `${name} rarity image`).alt[0],
				weaponType,
				atk: +(requiredText(children[3], `${name} attack`).match(/\d+/)?.[0] ?? 0),
				stat:
					requiredText(children[4], `${name} secondary stat`).match(/(.*)\(/)?.[1] ?? 'None',
				ability: requiredText(children[5], `${name} ability`),
			});
		}
	}
	return weapons;
}

export function writeWeapons(weapons: any[]) {
	writeFileSync(
		'../next/public/data/weapons.json',
		`${JSON.stringify(indexBy(weapons, prop('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'../next/src/types/weapon.d.ts',
		`export type WeaponKey =${weapons
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${weapons.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}
