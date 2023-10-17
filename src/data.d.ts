import type { ArtifactSetKey, StatKey, WeaponKey } from './good';

export interface Data {
	elements: Record<string, DElement>;
	characters: Record<string, DCharacter>;
	artifacts: Record<string, DArtifact>;
	weapons: Record<string, DWeapon>;
}

export interface DElement {
	key: string;
	image: string;
}

export interface DCharacter {
	key: string;
	name: string;
	element: string;
	weapontype: string;
	rarity: number;
	image: string;
}

export interface DArtifact {
	'key': string;
	'name': string;
	'2pc'?: string;
	'4pc'?: string;
	'rarity': number;
	'flower'?: string;
	'plume'?: string;
	'sands'?: string;
	'goblet'?: string;
	'circlet': string;
}

export interface DWeapon {
	key: string;
	name: string;
	weapontype: string;
	rarity: number;
	image: string;
}

export interface Tier {
	key: string;
	role: string;
	weapon: (WeaponKey | WeaponKey[])[];
	artifact: ArtifactSetKey[];
	mainStat: {
		sands: StatKey | StatKey[];
		goblet: StatKey | StatKey[];
		circlet: StatKey | StatKey[];
	};
	subStat: (StatKey | StatKey[])[];
}
