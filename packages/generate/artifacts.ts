import axios from 'axios';
import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { indexBy, prop } from 'remeda';

const artifactLocation = {
	// 4
	PrayersToSpringtime: 3,
	PrayersForIllumination: 3,
	PrayersForDestiny: 3,
	PrayersForWisdom: 3,
	Scholar: 2,
	Gambler: 2,
	MartialArtist: 2,
	BraveHeart: 2,
	DefendersWill: 2,
	TheExile: 1,
	Instructor: 1,
	Berserker: 1,
	TinyMiracle: 2,
	ResolutionOfSojourner: 2,
	// 3
	TravelingDoctor: 1,
	LuckyDog: 1,
	Adventurer: 1,
};

export async function fetchArtifacts() {
	const { data } = await axios.get('https://genshin-impact.fandom.com/wiki/Artifact/Sets');
	const dom = new JSDOM(data);

	const artifacts = [];
	let group = 8;
	for (const artifact of dom.window.document.querySelectorAll('.wikitable tr')) {
		const name = artifact.children[0].querySelector('a')?.textContent;
		if (!name) continue;

		const rarity = +artifact.children[1].textContent.match(/(\d+)★/)[1];
		if (rarity < 3) continue;

		const key = pascalCase(name.replaceAll("'", ''));
		const bonus = [
			...artifact.children[3].textContent.matchAll(/\d Piece: (.*?)(?=\d Piece:|$)/gs),
		];
		const images = [...artifact.children[2].querySelectorAll('img')].toReversed();
		artifacts.push({
			key,
			name,
			rarity,
			effect2Pc: bonus[0][1].trim(),
			effect4Pc: bonus[1]?.[1].trim(),
			group: rarity === 5 ? Math.floor(group++ / 2) : artifactLocation[key],
			flower: images[9]?.getAttribute('data-src').replace(/(\.png).*$/, '$1'),
			plume: images[7]?.getAttribute('data-src').replace(/(\.png).*$/, '$1'),
			sands: images[5]?.getAttribute('data-src').replace(/(\.png).*$/, '$1'),
			goblet: images[3]?.getAttribute('data-src').replace(/(\.png).*$/, '$1'),
			circlet: images[1].getAttribute('data-src').replace(/(\.png).*$/, '$1'),
		});
	}
	return artifacts.toReversed().map((artifact, order) => ({ ...artifact, order }));
}

export function writeArtifacts(artifacts: any[]) {
	writeFileSync(
		'../next/app/api/artifacts.json',
		`${JSON.stringify(indexBy(artifacts, prop('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'../next/src/types/artifactSet.d.ts',
		`export type ArtifactSetKey =${artifacts
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${artifacts.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}
