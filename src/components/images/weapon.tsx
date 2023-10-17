import type { SxProps } from '@mui/material';
import type { DWeapon } from '../../data';
import Image from '../image';

export default function WeaponImage({
	weapon,
	size = 50,
	sx,
}: {
	weapon: DWeapon;
	size?: number;
	sx?: SxProps;
}) {
	return (
		<Image
			alt={weapon?.name ?? 'weapon'}
			src={
				weapon?.image ??
				'https://static.wikia.nocookie.net/gensin-impact/images/7/7b/Icon_Inventory_Weapons.png'
			}
			width={size}
			height={size}
			className={`rarity${weapon?.rarity}`}
			sx={sx}
		/>
	);
}
