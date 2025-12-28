import { weaponImages, weaponsInfo, type WeaponType } from '@/api/weapons';
import OverlayText from '@/components/overlayText';
import { type DWeapon } from '@/types/data';
import { type IWeapon } from '@/types/good';
import { Avatar, type AvatarProps, Tooltip } from '@mui/material';
import Image from 'next/image';
import { Fragment } from 'react';

export default function WeaponImage({
	weapon,
	type,
	size = 100,
	hideStats,
	children,
	sx,
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
				sx={{
					width: size,
					height: size,
					overflow: 'hidden',
					position: 'relative',
					...sx,
				}}
				{...props}>
				<Image
					alt={weaponInfo?.name ?? type ?? 'weapon'}
					src={
						typeof weapon === 'object'
							? weapon.level > 40
								? (weaponInfo.image2 ?? weaponInfo.image)
								: weaponInfo.image
							: (weaponInfo?.image ?? weaponImages[type])
					}
					width={size}
					height={size}
					className={`rarity${weaponInfo?.rarity}`}
				/>
				{!hideStats && typeof weapon === 'object' && (
					<Fragment>
						<OverlayText>{weapon.level}</OverlayText>
						<OverlayText right>r{weapon.refinement}</OverlayText>
					</Fragment>
				)}
				{children}
			</Avatar>
		</Tooltip>
	);
}
