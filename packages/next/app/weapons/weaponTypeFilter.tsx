import { weaponImages, type WeaponType } from '@/api/weapons';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Image from 'next/image';
import { type Dispatch } from 'react';

export const weaponsTypes: WeaponType[] = ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow'];

export default function WeaponTypeFilter({
	weaponType,
	setWeaponType,
}: {
	weaponType: WeaponType;
	setWeaponType: Dispatch<WeaponType>;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={weaponType ?? 'none'}
			onChange={(_, newWeaponType) => {
				setWeaponType(newWeaponType === 'none' ? null : newWeaponType);
			}}>
			<ToggleButton value='none'>All</ToggleButton>
			{weaponsTypes.map((weaponType) => (
				<ToggleButton key={weaponType} value={weaponType} sx={{ p: 0 }}>
					<Image alt={weaponType} src={weaponImages[weaponType]} width={50} height={50} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
