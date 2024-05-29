import { WeaponType } from '@/api/weapons';
import { Button, ToggleButtonGroup } from '@mui/joy';
import WeaponImage from './weaponImage';

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
