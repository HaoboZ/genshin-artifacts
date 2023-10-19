import type { BoxProps } from '@mui/material';
import { Box, Tooltip } from '@mui/material';
import type { DWeapon } from '../../data';
import Image from '../image';

const images = {
	Sword: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Sword.png',
	Claymore: 'https://static.wikia.nocookie.net/gensin-impact/images/6/66/Icon_Claymore.png',
	Polearm: 'https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Icon_Polearm.png',
	Catalyst: 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Icon_Catalyst.png',
	Bow: 'https://static.wikia.nocookie.net/gensin-impact/images/8/81/Icon_Bow.png',
};

export default function WeaponImage({
	weapon,
	type,
	size = 50,
	...props
}: {
	weapon?: DWeapon;
	type?: 'Sword' | 'Claymore' | 'Polearm' | 'Catalyst' | 'Bow';
	size?: number;
} & BoxProps) {
	return (
		<Tooltip followCursor title={weapon?.name}>
			<Box height={size} {...props}>
				<Image
					alt={weapon?.name ?? type ?? 'weapon'}
					src={weapon?.image ?? images[type]}
					width={size}
					height={size}
					className={`rarity${weapon?.rarity}`}
					sx={{ borderRadius: 1 }}
				/>
			</Box>
		</Tooltip>
	);
}
