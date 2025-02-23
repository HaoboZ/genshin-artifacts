import type { WeaponType } from '@/app/weapons/weaponData';
import type { ArtifactSetKey, CharacterKey, StatKey, WeaponKey } from './good';

export interface DElement {
	key: string;
	image: string;
}

export interface DCharacter {
	key: CharacterKey;
	name: string;
	element: string;
	weaponType: WeaponType;
	rarity: number;
	talentMaterial?: string;
	weeklyMaterial?: string;
	image: string;
}

export interface DArtifact {
	key: ArtifactSetKey;
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
	key: WeaponKey;
	name: string;
	weaponType: string;
	rarity: number;
	image: string;
	image2: string;
}

export interface Build {
	key: CharacterKey;
	role: string;
	weapon: (WeaponKey | WeaponKey[])[];
	group: number;
	artifact: (ArtifactSetKey | ArtifactSetKey[])[];
	mainStat: {
		sands: StatKey | StatKey[];
		goblet: StatKey | StatKey[];
		circlet: StatKey | StatKey[];
	};
	subStat: (StatKey | StatKey[])[];
}
