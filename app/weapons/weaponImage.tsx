import { weaponImages, WeaponType } from '@/api/weapons';
import type { DWeapon } from '@/src/types/data';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';

export default function WeaponImage({
	weapon,
	type,
	size = 100,
	children,
	...props
}: { weapon?: DWeapon; type?: WeaponType; size?: number } & BoxProps) {
	return (
		<Tooltip followCursor title={weapon?.name}>
			<Box
				width={size}
				height={size}
				overflow='hidden'
				borderRadius={size / 10}
				position='relative'
				{...props}>
				<Image
					alt={weapon?.name ?? type ?? 'weapon'}
					src={weapon?.image ?? weaponImages[type]}
					width={size}
					height={size}
					className={`rarity${weapon?.rarity}`}
				/>
				{children}
			</Box>
		</Tooltip>
	);
}
