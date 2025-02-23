import type { WeaponType } from '@/api/weapons';
import { weaponImages, weaponsInfo } from '@/api/weapons';
import type { DWeapon } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import { Fragment } from 'react';

export default function WeaponImage({
	weapon,
	type,
	size = 100,
	hideStats,
	children,
	...props
}: {
	weapon: string | IWeapon;
	type?: WeaponType;
	size?: number;
	hideStats?: boolean;
} & AvatarProps) {
	const weaponInfo: DWeapon = weaponsInfo[typeof weapon !== 'object' ? weapon : weapon.key];
	return (
		<Tooltip followCursor title={weaponInfo?.name}>
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
					alt={weaponInfo?.name ?? type ?? 'weapon'}
					src={
						typeof weapon === 'object'
							? weapon.level > 40
								? weaponInfo.image2
								: weaponInfo.image
							: (weaponInfo?.image ?? weaponImages[type])
					}
					width={size}
					height={size}
					className={`rarity${weaponInfo?.rarity}`}
				/>
				{!hideStats && typeof weapon === 'object' && (
					<Fragment>
						<Typography
							sx={{
								position: 'absolute',
								top: 0,
								left: 0,
								bgcolor: 'white',
								borderRadius: 1,
								opacity: 0.75,
							}}>
							&nbsp;{weapon.level}&nbsp;
						</Typography>
						<Typography
							sx={{
								position: 'absolute',
								top: 0,
								right: 0,
								bgcolor: 'white',
								borderRadius: 1,
								opacity: 0.75,
							}}>
							&nbsp;r{weapon.refinement}&nbsp;
						</Typography>
					</Fragment>
				)}
				{children}
			</Avatar>
		</Tooltip>
	);
}
