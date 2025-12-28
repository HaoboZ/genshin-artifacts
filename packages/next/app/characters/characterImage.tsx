import { type DCharacter } from '@/types/data';
import { Avatar, type AvatarProps, Tooltip } from '@mui/material';
import Image from 'next/image';
import { type ReactNode } from 'react';

export default function CharacterImage({
	character,
	size = 100,
	children,
	tooltip,
	sx,
	...props
}: { character: DCharacter; size?: number; tooltip?: ReactNode } & AvatarProps) {
	return (
		<Tooltip followCursor title={tooltip ?? character.name}>
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
					alt={character.name}
					src={character.image}
					width={size}
					height={size}
					className={`rarity${character.rarity}`}
				/>
				{children}
			</Avatar>
		</Tooltip>
	);
}
