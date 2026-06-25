import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import { indexBy, prop } from 'remeda';
import fetchPage from '../fetchPage';
import { getImageUrl, required, requiredMatch, requiredText } from './helpers';

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
	const dom = await fetchPage('https://genshin-impact.fandom.com/wiki/Artifact/Sets', {
		waitForSelector: '.wikitable tr',
	});

	const artifacts = [];
	let group = 8;
	for (const artifact of dom.window.document.querySelectorAll('.wikitable tr')) {
		const name = artifact.children[0].querySelector('a')?.textContent;
		if (!name) continue;

		const rarity = +requiredMatch(
			requiredText(artifact.children[1], `${name} rarity`),
			/(\d+)★/,
			`${name} rarity`,
		)[1];
		if (rarity < 3) continue;

		const key = pascalCase(name.replaceAll("'", ''));
		const bonus = [
			...requiredText(artifact.children[3], `${name} bonuses`).matchAll(
				/\d-Piece: (.*?)(?=\d-Piece:|$)/gs,
			),
		];
		const images = [...artifact.children[2].querySelectorAll('img')].toReversed();
		artifacts.push({
			key,
			name,
			rarity,
			effect2Pc: required(bonus[0], `${name} 2-piece bonus`)[1].trim(),
			effect4Pc: bonus[1]?.[1].trim(),
			group:
				rarity === 5
					? Math.floor(group++ / 2)
					: required(artifactLocation[key], `${name} artifact location group`),
			flower: images[9] && getImageUrl(images[9], `${name} flower image`),
			plume: images[7] && getImageUrl(images[7], `${name} plume image`),
			sands: images[5] && getImageUrl(images[5], `${name} sands image`),
			goblet: images[3] && getImageUrl(images[3], `${name} goblet image`),
			circlet: getImageUrl(images[1], `${name} circlet image`),
		});
	}
	return artifacts.toReversed().map((artifact, order) => ({ ...artifact, order }));
}

export function writeArtifacts(artifacts: any[]) {
	writeFileSync(
		'../next/public/data/artifacts.json',
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
