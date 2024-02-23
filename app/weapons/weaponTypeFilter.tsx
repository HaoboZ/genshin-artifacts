import { Button, ToggleButtonGroup } from '@mui/joy';
import type { WeaponType } from './weaponData';
import { weaponsTypes } from './weaponData';
import WeaponImage from './weaponImage';

export default function WeaponTypeFilter({
	weaponType,
	setWeaponType,
}: {
	weaponType: WeaponType;
	setWeaponType: (weaponType: WeaponType) => void;
}) {
	return (
		<ToggleButtonGroup
			value={weaponType ?? 'none'}
			onChange={(e, newWeaponType) =>
				setWeaponType(newWeaponType === 'none' ? null : newWeaponType)
			}>
			<Button value='none'>All</Button>
			{weaponsTypes.map((weaponType) => (
				<Button key={weaponType} value={weaponType} sx={{ p: 0 }}>
					<WeaponImage type={weaponType} size={50} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
