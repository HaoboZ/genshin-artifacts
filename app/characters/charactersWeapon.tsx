import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import type { Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import { weaponsInfo } from '../weapons/weaponData';
import WeaponImage from '../weapons/weaponImage';
import { charactersInfo } from './characterData';

export default function CharactersWeapon({ weapon, tier }: { weapon: IWeapon; tier: Tier }) {
	const weaponData = weaponsInfo[weapon?.key];

	const tierIndex = useMemo(() => arrDeepIndex(tier.weapon, weapon?.key), [tier, weapon]);

	return (
		<Box>
			<WeaponImage weapon={weaponData} type={charactersInfo[tier.key].weaponType} size={50} />
			<PercentBar p={weapon && tierIndex !== -1 ? 1 - tierIndex / tier.weapon.length : 0} />
		</Box>
	);
}
