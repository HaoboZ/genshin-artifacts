import type { DCharacter } from '@/src/types/data';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';

export default function CharacterImage({
	character,
	size = 100,
	children,
	...props
}: { character: DCharacter; size?: number } & BoxProps) {
	return (
		<Tooltip followCursor title={character.name}>
			<Box width={size} height={size} overflow='hidden' borderRadius={size / 10} {...props}>
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
