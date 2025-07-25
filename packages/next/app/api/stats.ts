import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import statArrMatch from '@/src/helpers/statArrMatch';
import type { Build } from '@/src/types/data';
import type { IArtifact, SlotKey, StatKey } from '@/src/types/good';
import { artifactSetsInfo } from './artifacts';

export const artifactSlotStats: Record<SlotKey, { name: string; stats: StatKey[] }> = {
	flower: { name: 'Flower', stats: ['hp'] },
	plume: { name: 'Plume', stats: ['atk'] },
	sands: { name: 'Sands', stats: ['hp_', 'atk_', 'def_', 'eleMas', 'enerRech_'] },
	goblet: {
		name: 'Goblet',
		stats: [
			'hp_',
			'atk_',
			'def_',
			'eleMas',
			'pyro_dmg_',
			'electro_dmg_',
			'cryo_dmg_',
			'hydro_dmg_',
			'dendro_dmg_',
			'anemo_dmg_',
			'geo_dmg_',
			'physical_dmg_',
		],
	},
	circlet: {
		name: 'Circlet',
		stats: ['hp_', 'atk_', 'def_', 'eleMas', 'critRate_', 'critDMG_', 'heal_'],
	},
};

export const statName: Record<StatKey, string> = {
	anemo_dmg_: 'Anemo DMG',
	atk: 'ATK',
	atk_: 'ATK %',
	critDMG_: 'Crit DMG',
	critRate_: 'Crit Rate',
	critRD_: 'Crit Rate/DMG',
	cryo_dmg_: 'Cryo DMG',
	def: 'DEF',
	def_: 'DEF %',
	dendro_dmg_: 'Dendro DMG',
	eleMas: 'Elemental Mastery',
	electro_dmg_: 'Electro DMG',
	enerRech_: 'Energy Recharge',
	geo_dmg_: 'Geo DMG',
	heal_: 'Healing Bonus',
	hp: 'HP',
	hp_: 'HP %',
	hydro_dmg_: 'Hydro DMG',
	physical_dmg_: 'Physical DMG',
	pyro_dmg_: 'Pyro DMG',
};

export const subStats: StatKey[] = [
	'hp',
	'hp_',
	'atk',
	'atk_',
	'def',
	'def_',
	'eleMas',
	'enerRech_',
	'critRate_',
	'critDMG_',
];

export const statsMax: Record<StatKey, number> = {
	hp: 1793,
	hp_: 35,
	atk: 117,
	atk_: 35,
	def: 139,
	def_: 43.7,
	eleMas: 140,
	enerRech_: 38.9,
	critRate_: 23.3,
	critDMG_: 46.6,
	critRD_: undefined,
	anemo_dmg_: undefined,
	cryo_dmg_: undefined,
	dendro_dmg_: undefined,
	electro_dmg_: undefined,
	geo_dmg_: undefined,
	heal_: undefined,
	hydro_dmg_: undefined,
	physical_dmg_: undefined,
	pyro_dmg_: undefined,
};

export const statsAverage: Record<StatKey, Record<number, number>> = {
	hp: { 3: 121.89, 4: 203.15, 5: 253.94 },
	hp_: { 3: 2.975, 4: 3.96, 5: 4.955 },
	atk: { 3: 7.94, 4: 13.225, 5: 16.535 },
	atk_: { 3: 2.975, 4: 3.96, 5: 4.955 },
	def: { 3: 9.445, 4: 15.74, 5: 19.675 },
	def_: { 3: 3.715, 4: 4.955, 5: 6.195 },
	eleMas: { 3: 11.89, 4: 15.855, 5: 19.815 },
	enerRech_: { 3: 3.305, 4: 4.405, 5: 5.505 },
	critRate_: { 3: 1.98, 4: 2.645, 5: 3.305 },
	critDMG_: { 3: 3.96, 4: 5.285, 5: 6.605 },
	critRD_: undefined,
	anemo_dmg_: undefined,
	cryo_dmg_: undefined,
	dendro_dmg_: undefined,
	electro_dmg_: undefined,
	geo_dmg_: undefined,
	heal_: undefined,
	hydro_dmg_: undefined,
	physical_dmg_: undefined,
	pyro_dmg_: undefined,
};

export function weightedPercent(build: Build, artifact: IArtifact) {
	if (!build || !artifact) return 0;
	if (
		artifact.slotKey !== 'flower' &&
		artifact.slotKey !== 'plume' &&
		!statArrMatch(makeArray(build.mainStat[artifact.slotKey])[0], artifact.mainStatKey)
	)
		return 0;

	return (
		(artifact.substats.reduce(
			(current, { key, value }) =>
				current + (getWeightedStat(build.subStat, key) * value) / statsMax[key],
			0,
		) /
			getMaxStat(build.subStat, artifact.mainStatKey)) *
		(artifact.rarity === artifactSetsInfo[artifact.setKey].rarity ? 1 : 0.75)
	);
}

export function potentialPercent(build: Build, artifact: IArtifact) {
	if (!build || !artifact) return 0;
	if (
		artifact.slotKey !== 'flower' &&
		artifact.slotKey !== 'plume' &&
		!statArrMatch(makeArray(build.mainStat[artifact.slotKey])[0], artifact.mainStatKey)
	)
		return 0;

	const rolls =
		Math.ceil((artifact.rarity * 4 - artifact.level) / 4) - (4 - artifact.substats.length);

	return (
		(artifact.substats.reduce(
			(current, { key, value }) =>
				current +
				(getWeightedStat(build.subStat, key) *
					(value + (rolls / 4) * statsAverage[key][artifact.rarity])) /
					statsMax[key],
			0,
		) /
			getMaxStat(build.subStat, artifact.mainStatKey)) *
		(artifact.rarity === artifactSetsInfo[artifact.setKey].rarity ? 1 : 0.75)
	);
}

export function maxPotentialPercents(builds: Build[], artifact: IArtifact) {
	const setKey = artifact.setKey;
	return builds
		.filter(({ artifact }) => makeArray(artifact[0])[0] === setKey)
		.map((build) => potentialPercent(build, artifact))
		.reduce((a, b) => (a > b ? a : b), 0);
}

export function maxPotentialBuild(builds: Build[], artifact: IArtifact) {
	const setKey = artifact.setKey;
	return builds
		.filter(({ artifact }) => makeArray(artifact[0])[0] === setKey)
		.map((build) => ({ build, potential: potentialPercent(build, artifact) }))
		.reduce((a, b) => (a.potential > b.potential ? a : b), { build: undefined, potential: 0 });
}

function getWeightedStat(subStatArr: (StatKey | StatKey[])[], subStat: StatKey) {
	if (!subStat) return 0;

	const statTier = arrDeepIndex(convertCD(subStatArr), subStat);
	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}

function getMaxStat(subStatArr: (StatKey | StatKey[])[], mainStat: StatKey) {
	let count = 0;
	let max = 0;
	const subStats = convertCD(subStatArr);
	for (let tier = 0; tier < subStats.length; tier++) {
		const statArr = makeArray(subStats[tier]).filter((stat) => stat !== mainStat);
		for (let i = 0; i < statArr.length; i++) {
			if (count >= 4) break;
			max += (1 - Math.min(4, tier) * 0.2) / (count ? 6 : 1);
			++count;
		}
	}
	return max;
}

function convertCD(subStatArr: (StatKey | StatKey[])[]) {
	return subStatArr.map((subStat) => {
		if (typeof subStat === 'string') {
			if (subStat === 'critRD_') return ['critRate_', 'critDMG_'] as StatKey[];
		} else {
			const index = subStat.indexOf('critRD_');
			if (index !== -1) return subStat.toSpliced(index, 1, 'critRate_', 'critDMG_');
		}
		return subStat;
	});
}
