import type { DCharacter } from '@/src/types/data';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip } from '@mui/material';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function CharacterImage({
	character,
	size = 100,
	children,
	tooltip,
	...props
}: { character: DCharacter; size?: number; tooltip?: ReactNode } & AvatarProps) {
	return (
		<Tooltip followCursor title={tooltip ?? character.name}>
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
