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
	weaponType: string;
	rarity: number;
	image: string;
}

export interface DArtifact {
	key: string;
	name: string;
	effect2Pc?: string;
	effect4Pc?: string;
	rarity: number;
	order: number;
	group: number;
	flower?: string;
	plume?: string;
	sands?: string;
	goblet?: string;
	circlet: string;
}

export interface DWeapon {
	key: string;
	name: string;
	weaponType: string;
	rarity: number;
	image: string;
}

export interface Tier {
	key: string;
	role: string;
	weapon: (WeaponKey | WeaponKey[])[];
	artifact: (ArtifactSetKey | ArtifactSetKey[])[];
	mainStat: {
		sands: StatKey | StatKey[];
		goblet: StatKey | StatKey[];
		circlet: StatKey | StatKey[];
	};
	subStat: (StatKey | StatKey[])[];
}
