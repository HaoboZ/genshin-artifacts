import PercentBar from '@/components/percentBar';
import { data } from '@/src/resources/data';
import type { DWeapon, Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { Box } from '@mui/joy';
import { findIndex, includes } from 'lodash';
import WeaponImage from '../weapons/weaponImage';

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
