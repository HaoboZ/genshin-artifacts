import pget from '@/src/helpers/pget';
import type { ArtifactSetKey } from '@/src/types/good';
import axios from 'axios';
import { pascalCase } from 'change-case';
import { writeFileSync } from 'fs';
import genshindb from 'genshin-db';
import { indexBy, mapValues, pick, unique } from 'remeda';

const artifactLocation: Record<ArtifactSetKey, number> = {
	// 5
	ObsidianCodex: 21,
	ScrollOfTheHeroOfCinderCity: 21,
	UnfinishedReverie: 20,
	FragmentOfHarmonicWhimsy: 20,
	NighttimeWhispersInTheEchoingWoods: 19,
	SongOfDaysPast: 19,
	GoldenTroupe: 18,
	MarechausseeHunter: 18,
	VourukashasGlow: 17,
	NymphsDream: 17,
	FlowerOfParadiseLost: 16,
	DesertPavilionChronicle: 16,
	GildedDreams: 15,
	DeepwoodMemories: 15,
	EchoesOfAnOffering: 14,
	VermillionHereafter: 14,
	OceanHuedClam: 13,
	HuskOfOpulentDreams: 13,
	EmblemOfSeveredFate: 12,
	ShimenawasReminiscence: 12,
	PaleFlame: 11,
	TenacityOfTheMillelith: 11,
	HeartOfDepth: 10,
	BlizzardStrayer: 10,
	CrimsonWitchOfFlames: 9,
	Lavawalker: 9,
	ThunderingFury: 8,
	Thundersoother: 8,
	RetracingBolide: 7,
	ArchaicPetra: 7,
	ViridescentVenerer: 6,
	MaidenBeloved: 6,
	BloodstainedChivalry: 5,
	NoblesseOblige: 5,
	WanderersTroupe: 4,
	GladiatorsFinale: 4,
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
const artifactOrder = Object.keys(artifactLocation);

(async () => {
	try {
		console.log('Writing elements');
		await writeElements();
		console.log('Writing characters');
		await writeCharacters();
		console.log('Writing artifacts');
		await writeArtifacts();
		console.log('Writing weapons');
		await writeWeapons();
		console.log('Completed');
	} catch (error) {
		console.log('An error has occurred ', error);
	}
})();

async function writeElements() {
	const elementsData = genshindb.elements('names', {
		matchCategories: true,
		verboseCategories: true,
	});
	const elements = mapValues(indexBy(elementsData, pget('name')), pget('images.base64'));

	writeFileSync('./app/api/elements.json', `${JSON.stringify(elements, null, '\t')}\n`);
}

async function writeCharacters() {
	const talents = genshindb.talents('names', { matchCategories: true, verboseCategories: true });
	const { data: characterUrl } = await axios.get(
		'https://genshin-impact.fandom.com/wiki/Character/Ascension',
	);
	const characterImages = unique(
		[
			...characterUrl.matchAll(
				/data-src="(https:\/\/static.wikia.nocookie.net\/gensin-impact\/images\/.\/..\/[^"]*_Icon\.png)\/revision/g,
			),
		].map(pget('1')),
	);
	const charactersData = genshindb.characters('names', {
		matchCategories: true,
		verboseCategories: true,
	});
	const characters = charactersData
		.filter(({ name }) => name !== 'Lumine')
		.map((character) => {
			if (character.name === 'Aether') character.name = 'Traveler';
			const characterName = character.name.replaceAll(' ', '_');
			const image = characterImages.find((url) => url.indexOf(characterName) !== -1);
			if (!image) console.log(characterName);
			const talent = talents.find(({ name }) => name === character.name);
			return {
				key: pascalCase(character.name),
				...pick(character, ['name', 'rarity']),
				weaponType: character.weaponText,
				element: character.elementText,
				talentMaterial: talent?.costs.lvl2[1].name,
				weeklyMaterial: talent?.costs.lvl7[3].name,
				image,
			};
		})
		.filter(pget('image'));

	writeFileSync(
		'./app/api/characters.json',
		`${JSON.stringify(indexBy(characters, pget('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'./src/types/character.d.ts',
		`export type CharacterKey =${characters
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${characters.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}

async function writeArtifacts() {
	const { data: artifactUrl } = await axios.get(
		'https://genshin-impact.fandom.com/wiki/Artifact/Sets',
	);
	const artifactImages = unique(
		[
			...artifactUrl.matchAll(
				/data-src="(https:\/\/static.wikia.nocookie.net\/gensin-impact\/images\/.\/..\/Item_[^"]*)\/revision/g,
			),
		].map(pget('1')),
	);
	const artifactsData = genshindb.artifacts('names', {
		matchCategories: true,
		verboseCategories: true,
	});
	const artifacts = artifactsData.map((artifact) => {
		const flowerName = artifact.flower?.name.replaceAll(' ', '_').replaceAll("'", '%27');
		const flower =
			artifact.flower && artifactImages.find((url) => url.indexOf(flowerName) !== -1);
		if (artifact.flower && !flower) console.log(flowerName);
		let plumeName = artifact.plume?.name.replaceAll(' ', '_').replaceAll("'", '%27');
		if (plumeName === 'Maiden%27s_Heart-stricken_Infatuation')
			plumeName = 'Maiden%27s_Heart-Stricken_Infatuation';
		const plume = artifact.plume && artifactImages.find((url) => url.indexOf(plumeName) !== -1);
		if (artifact.plume && !plume) console.log(plumeName);
		const sandsName = artifact.sands?.name.replaceAll(' ', '_').replaceAll("'", '%27');
		const sands = artifact.sands && artifactImages.find((url) => url.indexOf(sandsName) !== -1);
		if (artifact.sands && !sands) console.log(sandsName);
		const gobletName = artifact.goblet?.name.replaceAll(' ', '_').replaceAll("'", '%27');
		const goblet =
			artifact.goblet && artifactImages.find((url) => url.indexOf(gobletName) !== -1);
		if (artifact.goblet && !goblet) console.log(gobletName);
		const circletName = artifact.circlet?.name.replaceAll(' ', '_').replaceAll("'", '%27');
		const circlet =
			artifact.circlet && artifactImages.find((url) => url.indexOf(circletName) !== -1);
		if (artifact.circlet && !circlet) console.log(circletName);

		const key = pascalCase(artifact.name.replaceAll("'", ''));
		return {
			key,
			...pick(artifact, ['name', 'effect2Pc', 'effect4Pc']),
			rarity: Math.max(...artifact.rarityList),
			order: artifactOrder.indexOf(key),
			group: artifactLocation[key],
			flower,
			plume,
			sands,
			goblet,
			circlet,
		};
	});

	writeFileSync(
		'./app/api/artifacts.json',
		`${JSON.stringify(indexBy(artifacts, pget('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'./src/types/artifactSet.d.ts',
		`export type ArtifactSetKey =${artifacts
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${artifacts.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}

async function writeWeapons() {
	const weaponsData = genshindb.weapons('names', {
		matchCategories: true,
		verboseCategories: true,
	});
	const weapons = await Promise.all(
		weaponsData
			.filter(({ name, rarity }) => name !== 'Prized Isshin Blade' && rarity >= 3)
			.map(async (weapon) => {
				const weaponName = weapon.name
					.replaceAll(' ', '_')
					.replaceAll("'", '%27')
					.replaceAll('"', '');
				const { data } = await axios.get(
					`https://genshin-impact.fandom.com/wiki/${weaponName}`,
				);
				const images = [
					...data.matchAll(
						/<img src="(https:\/\/static.wikia.nocookie.net\/gensin-impact\/images\/.\/..\/Weapon_[^"]*)\/revision/g,
					),
				].map(pget('1'));
				if (images.length !== 2) throw 'Image not found';

				return {
					key: pascalCase(weapon.name.replaceAll("'", '')),
					...pick(weapon, ['name', 'rarity']),
					weaponType: weapon.weaponText,
					image: images[0],
					image2: images[1],
				};
			}),
	);

	writeFileSync(
		'./app/api/weapons.json',
		`${JSON.stringify(indexBy(weapons, pget('key')), null, '\t')}\n`,
	);
	writeFileSync(
		'./src/types/weapon.d.ts',
		`export type WeaponKey =${weapons
			.map(
				({ key, name }, index) =>
					`\n\t| '${key}'${weapons.length - 1 === index ? ';' : ''} // ${name}`,
			)
			.join('')}\n`,
	);
}
