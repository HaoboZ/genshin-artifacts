import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { DWeapon } from '@/src/types/data';
import type { WeaponKey } from '@/src/types/good';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import data from './weapons.json';

export type WeaponType = 'Sword' | 'Claymore' | 'Polearm' | 'Catalyst' | 'Bow';

export const weaponImages: Record<WeaponType, string> = {
	Sword: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Sword.png',
	Claymore: 'https://static.wikia.nocookie.net/gensin-impact/images/6/66/Icon_Claymore.png',
	Polearm: 'https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Icon_Polearm.png',
	Catalyst: 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Icon_Catalyst.png',
	Bow: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Bow.png',
};

export const weaponsInfo: Record<WeaponKey, DWeapon> = data as any;

export function useWeapons({
	type,
	rarity: rarityType,
	search,
}: {
	type?: string;
	rarity?: number;
	search?: string;
}) {
	const weapons = useAppSelector(pget('good.weapons'));

	const searchVal = search.toLowerCase();

	return useMemo(
		() =>
			pipe(
				weapons,
				map((weapon) => ({ ...weapon, ...weaponsInfo[weapon.key] })),
				filter(
					({ weaponType, rarity, name }) =>
						(!type || weaponType === type) &&
						(!rarityType || rarityType === rarity) &&
						(search ? name.toLowerCase().includes(searchVal) : true),
				),
				sortBy([pget('rarity'), 'desc'], [pget('level'), 'desc'], pget('key'), [
					pget('refinement'),
					'desc',
				]),
			),
		[weapons, type, rarityType, search],
	);
}
