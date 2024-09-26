import type { WeaponType } from '@/api/weapons';
import { weaponImages } from '@/api/weapons';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Image from 'next/image';

export const weaponsTypes: WeaponType[] = ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow'];

export default function WeaponTypeFilter({
	weaponType,
	setWeaponType,
}: {
	weaponType: WeaponType;
	setWeaponType: (weaponType: WeaponType) => void;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={weaponType ?? 'none'}
			onChange={(e, newWeaponType) =>
				setWeaponType(newWeaponType === 'none' ? null : newWeaponType)
			}>
			<ToggleButton value='none'>All</ToggleButton>
			{weaponsTypes.map((weaponType) => (
				<ToggleButton key={weaponType} value={weaponType} sx={{ p: 0 }}>
					<Image alt={weaponType} src={weaponImages[weaponType]} width={50} height={50} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
