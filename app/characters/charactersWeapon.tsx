import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import type { DWeapon, Tier } from '@/src/types/data';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import WeaponImage from '../weapons/weaponImage';
import { charactersInfo } from './characterData';

export default function CharactersWeapon({ weapon, tier }: { weapon: DWeapon; tier: Tier }) {
	const tierIndex = useMemo(() => arrDeepIndex(tier.weapon, weapon?.key), [tier, weapon]);

	return (
		<Box>
			<WeaponImage weapon={weapon} type={charactersInfo[tier.key].weaponType} size={50} />
			<PercentBar p={weapon && tierIndex !== -1 ? 1 - tierIndex / tier.weapon.length : 0} />
		</Box>
	);
}
