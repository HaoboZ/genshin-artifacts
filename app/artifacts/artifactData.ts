import data from '@/public/data.json';
import type { DArtifact, Tier } from '@/src/types/data';
import type { ArtifactSetKey, SlotKey, StatKey } from '@/src/types/good';

export const artifactSetsInfo: Record<ArtifactSetKey, DArtifact> = data.artifacts as any;

export const artifactSlotImages = {
	flower: 'https://static.wikia.nocookie.net/gensin-impact/images/2/2d/Icon_Flower_of_Life.png',
	plume: 'https://static.wikia.nocookie.net/gensin-impact/images/8/8b/Icon_Plume_of_Death.png',
	sands: 'https://static.wikia.nocookie.net/gensin-impact/images/9/9f/Icon_Sands_of_Eon.png',
	goblet:
		'https://static.wikia.nocookie.net/gensin-impact/images/3/37/Icon_Goblet_of_Eonothem.png',
	circlet: 'https://static.wikia.nocookie.net/gensin-impact/images/6/64/Icon_Circlet_of_Logos.png',
};

export const missingArtifactSets: Record<string, Tier> = {
	UnfinishedReverie: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['UnfinishedReverie'],
		mainStat: { sands: ['eleMas', 'atk_'], goblet: 'cryo_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'eleMas', 'atk_', 'atk'],
	},
	SongOfDaysPast: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['SongOfDaysPast'],
		mainStat: { sands: 'hp_', goblet: 'hp_', circlet: 'heal_' },
		subStat: ['hp_', 'atk_', 'hp', 'atk'],
	},
	VourukashasGlow: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['VourukashasGlow'],
		mainStat: { sands: 'hp_', goblet: 'hp_', circlet: 'hp_' },
		subStat: ['hp_', 'enerRech_', 'atk_', 'hp', 'critRD_'],
	},
	EchoesOfAnOffering: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['EchoesOfAnOffering'],
		mainStat: { sands: 'atk_', goblet: 'hydro_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'atk_', 'enerRech_', 'hp_', 'eleMas', 'atk'],
	},
	ArchaicPetra: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['ArchaicPetra'],
		mainStat: { sands: 'atk_', goblet: 'geo_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'atk_', 'enerRech_', 'atk'],
	},
	BloodstainedChivalry: {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		artifact: ['BloodstainedChivalry'],
		mainStat: { sands: 'atk_', goblet: 'physical_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'atk_', 'atk', 'enerRech_'],
	},
};

export const artifactSlotOrder: SlotKey[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export const artifactSlotInfo: Record<SlotKey, { name: string; stats: StatKey[] }> = {
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
	atk_: 'ATK%',
	critDMG_: 'Crit DMG',
	critRate_: 'Crit Rate',
	critRD_: 'Crit Rate/DMG',
	cryo_dmg_: 'Cryo DMG',
	def: 'DEF',
	def_: 'DEF%',
	dendro_dmg_: 'Dendro DMG',
	eleMas: 'EM',
	electro_dmg_: 'Electro DMG',
	enerRech_: 'ER',
	geo_dmg_: 'Geo DMG',
	heal_: 'Healing',
	hp: 'HP',
	hp_: 'HP%',
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

export const statsMax: Record<StatKey, Record<number, number>> = {
	hp: { 3: 287, 4: 956, 5: 1793 },
	hp_: { 3: 7, 4: 18.6, 5: 35 },
	atk: { 3: 19, 4: 62, 5: 117 },
	atk_: { 3: 7, 4: 18.6, 5: 35 },
	def: { 3: 22, 4: 74, 5: 139 },
	def_: { 3: 8.7, 4: 23.3, 5: 43.7 },
	eleMas: { 3: 28, 4: 75, 5: 140 },
	enerRech_: { 3: 7.8, 4: 20.7, 5: 38.9 },
	critRate_: { 3: 4.7, 4: 12.4, 5: 23.3 },
	critDMG_: { 3: 9.3, 4: 24.9, 5: 46.6 },
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

export const statsAdd: Record<StatKey, Record<number, number>> = {
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

export const rarityWeight = { 3: 1.9, 4: 1.45, 5: 1.3 };
