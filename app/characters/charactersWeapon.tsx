import WeaponImage from '@/components/images/weapon';
import PercentBar from '@/components/percentBar';
import type { DWeapon, Tier } from '@/src/data';
import type { IWeapon } from '@/src/good';
import { data } from '@/src/resources/data';
import { Box } from '@mui/material';
import { findIndex, includes } from 'lodash';

export default function CharactersWeapon({ weapon, tier }: { weapon: IWeapon; tier: Tier }) {
	const weaponData = data.weapons[weapon?.key] as DWeapon;

	const tierIndex = findIndex(tier.weapon, (weaponTier) =>
		Array.isArray(weaponTier) ? includes(weaponTier, weapon?.key) : weaponTier === weapon?.key,
	);

	return (
		<Box>
			<WeaponImage weapon={weaponData} type={data.characters[tier.key].weaponType as any} />
			<PercentBar p={weapon && tierIndex !== -1 ? 1 - tierIndex / tier.weapon.length : 0} />
		</Box>
	);
}
