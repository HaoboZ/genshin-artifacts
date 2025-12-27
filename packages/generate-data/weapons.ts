import axios from 'axios';
import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { indexBy, prop } from 'remeda';

export async function fetchWeapons() {
	const { data } = await axios.get(
		'https://genshin-impact.fandom.com/wiki/Weapon/List/By_Weapon_Type',
	);
	const dom = new JSDOM(data);

	const weapons = [];

	for (const weaponTypeTable of dom.window.document.querySelectorAll('.article-table')) {
		const weaponType = weaponTypeTable.previousElementSibling.querySelector('a').title;
		for (const { children } of weaponTypeTable.querySelectorAll('tr')) {
			const name = children[1].querySelector('a')?.textContent;
			if (!name) continue;

			if (children[5].children.length) children[5].removeChild(children[5].firstElementChild);
			weapons.push({
				key: pascalCase(name.replaceAll("'", '')),
				name,
				image: children[0]
					.querySelector('img')
					.getAttribute('data-src')
					.replace(/(\.png).*$/, '$1'),
				// image2: images[1],
				rarity: +children[2].querySelector('img').alt[0],
				weaponType,
				atk: +(children[3].textContent.match(/\d+/)?.[0] ?? 0),
				stat: children[4].textContent.match(/(.*)\(/)?.[1] ?? 'None',
				ability: children[5].textContent.trim(),
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
