import type { DWeapon } from '@/src/types/data';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';
import type { WeaponType } from './weaponData';
import { weaponImages } from './weaponData';

export default function WeaponImage({
	weapon,
	type,
	size = 100,
	...props
}: { weapon?: DWeapon; type?: WeaponType; size?: number } & BoxProps) {
	return (
		<Tooltip followCursor title={weapon?.name}>
			<Box width={size} height={size} overflow='hidden' borderRadius={size / 10} {...props}>
				<Image
					alt={weapon?.name ?? type ?? 'weapon'}
					src={weapon?.image ?? weaponImages[type]}
					width={size}
					height={size}
					className={`rarity${weapon?.rarity}`}
				/>
			</Box>
		</Tooltip>
	);
}
