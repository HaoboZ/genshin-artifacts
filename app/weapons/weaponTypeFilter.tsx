import WeaponImage from '@/components/images/weapon';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const images = {
	Sword: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Sword.png',
	Claymore: 'https://static.wikia.nocookie.net/gensin-impact/images/6/66/Icon_Claymore.png',
	Polearm: 'https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Icon_Polearm.png',
	Catalyst: 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Icon_Catalyst.png',
	Bow: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Bow.png',
};

export default function WeaponTypeFilter({
	weaponType,
	setWeaponType,
}: {
	weaponType: string;
	setWeaponType: (weaponType: string) => void;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={weaponType}
			onChange={(e, newWeaponType) => setWeaponType(newWeaponType ?? '')}>
			<ToggleButton value=''>All</ToggleButton>
			{Object.keys(images).map((weaponType) => (
				<ToggleButton key={weaponType} value={weaponType} sx={{ p: 0.5 }}>
					<WeaponImage type={weaponType as any} size={40} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
