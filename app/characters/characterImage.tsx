import type { DCharacter } from '@/src/types/data';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function CharacterImage({
	character,
	size = 100,
	children,
	tooltip,
	...props
}: { character: DCharacter; size?: number; tooltip?: ReactNode } & BoxProps) {
	return (
		<Tooltip followCursor title={tooltip ?? character.name}>
			<Box
				width={size}
				height={size}
				overflow='hidden'
				borderRadius={size / 10}
				position='relative'
				{...props}>
				<Image
					alt={character.name}
					src={character.image}
					width={size}
					height={size}
					className={`rarity${character.rarity}`}
				/>
				{children}
			</Box>
		</Tooltip>
	);
}
