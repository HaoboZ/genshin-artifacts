import WeaponImage from '@/components/images/weapon';
import PercentBar from '@/components/percentBar';
import data from '@/public/data.json';
import type { DWeapon, Tier } from '@/src/data';
import type { IWeapon } from '@/src/good';
import { findIndex, includes } from 'lodash';
import { Fragment } from 'react';

export default function WeaponCard({ weapon, tier }: { weapon: IWeapon; tier: Tier }) {
	const weaponData = data.weapons[weapon?.key] as DWeapon;

	const tierIndex = findIndex(tier?.weapon, (weaponTier) =>
		Array.isArray(weaponTier) ? includes(weaponTier, weapon?.key) : weaponTier === weapon?.key,
	);

	return (
		<Fragment>
			<WeaponImage weapon={weaponData} />
			<PercentBar vals={[{ reverse: true, max: tier?.weapon.length, current: tierIndex }]} />
		</Fragment>
	);
}
