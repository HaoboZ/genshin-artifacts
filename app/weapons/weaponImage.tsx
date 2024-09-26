import type { WeaponType } from '@/api/weapons';
import { weaponImages } from '@/api/weapons';
import type { DWeapon } from '@/src/types/data';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip } from '@mui/material';
import Image from 'next/image';

export default function WeaponImage({
	weapon,
	type,
	size = 100,
	children,
	...props
}: { weapon?: DWeapon; type?: WeaponType; size?: number } & AvatarProps) {
	return (
		<Tooltip followCursor title={weapon?.name}>
			<Avatar
				variant='rounded'
				{...props}
				sx={{
					width: size,
					height: size,
					overflow: 'hidden',
					position: 'relative',
					...props.sx,
				}}>
				<Image
					alt={weapon?.name ?? type ?? 'weapon'}
					src={weapon?.image ?? weaponImages[type]}
					width={size}
					height={size}
					className={`rarity${weapon?.rarity}`}
				/>
				{children}
			</Avatar>
		</Tooltip>
	);
}
