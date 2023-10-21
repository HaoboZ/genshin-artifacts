import data from '@/src/resources/data.json';
import type { DWeapon } from '@/src/types/data';
import type { WeaponKey } from '@/src/types/good';

export type WeaponType = 'Sword' | 'Claymore' | 'Polearm' | 'Catalyst' | 'Bow';

export const weaponsTypes: WeaponType[] = ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow'];

export const weaponImages: Record<WeaponType, string> = {
	Sword: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Sword.png',
	Claymore: 'https://static.wikia.nocookie.net/gensin-impact/images/6/66/Icon_Claymore.png',
	Polearm: 'https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Icon_Polearm.png',
	Catalyst: 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Icon_Catalyst.png',
	Bow: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Bow.png',
};

export const weaponsInfo: Record<WeaponKey, DWeapon> = data.weapons;
