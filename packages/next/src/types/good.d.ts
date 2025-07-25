// https://frzyc.github.io/genshin-optimizer/#/doc

export interface IGOOD {
	format: 'GOOD'; // A way for people to recognize this format.
	version: number; // GOOD API version.
	source: string; // The app that generates this data.
	characters?: ICharacter[];
	artifacts?: IArtifact[];
	weapons?: IWeapon[];
}

export interface IArtifact {
	id?: string;
	setKey: ArtifactSetKey; //e.g. "GladiatorsFinale"
	slotKey: SlotKey; //e.g. "plume"
	level: number; //0-20 inclusive
	rarity: number; //1-5 inclusive
	mainStatKey: StatKey;
	location: CharacterKey | ''; //where "" means not equipped.
	lock: boolean; //Whether the artifact is locked in game.
	substats: ISubstat[];
}

export interface ISubstat {
	key: StatKey; //e.g. "critDMG_"
	value: number; //e.g. 19.4
}

export type SlotKey = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';

export interface IWeapon {
	id?: string;
	key: WeaponKey; //"CrescentPike"
	level: number; //1-90 inclusive
	ascension: number; //0-6 inclusive. need to disambiguate 80/90 or 80/80
	refinement: number; //1-5 inclusive
	location: CharacterKey | ''; //where "" means not equipped.
	lock: boolean; //Whether the weapon is locked in game.
}

export interface ICharacter {
	key: CharacterKey; //e.g. "Rosaria"
	level: number; //1-90 inclusive
	constellation: number; //0-6 inclusive
	ascension: number; //0-6 inclusive. need to disambiguate 80/90 or 80/80
	talent: {
		//does not include boost from constellations. 1-15 inclusive
		auto: number;
		skill: number;
		burst: number;
	};
}

export type StatKey =
	| 'hp' //HP
	| 'hp_' //HP%
	| 'atk' //ATK
	| 'atk_' //ATK%
	| 'def' //DEF
	| 'def_' //DEF%
	| 'eleMas' //Elemental Mastery
	| 'enerRech_' //Energy Recharge
	| 'heal_' //Healing Bonus
	| 'critRate_' //CRIT Rate
	| 'critDMG_' //CRIT DMG
	| 'critRD_' // CRIT Rate/DMG
	| 'physical_dmg_' //Physical DMG Bonus
	| 'anemo_dmg_' //Anemo DMG Bonus
	| 'geo_dmg_' //Geo DMG Bonus
	| 'electro_dmg_' //Electro DMG Bonus
	| 'hydro_dmg_' //Hydro DMG Bonus
	| 'pyro_dmg_' //Pyro DMG Bonus
	| 'cryo_dmg_' //Cryo DMG Bonus
	| 'dendro_dmg_'; //Dendro DMG Bonus

export type { ArtifactSetKey } from './artifactSet';
export type { CharacterKey } from './character';
export type { WeaponKey } from './weapon';
