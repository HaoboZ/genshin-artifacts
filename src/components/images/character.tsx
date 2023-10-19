import type { BoxProps } from '@mui/material';
import { Box, Tooltip } from '@mui/material';
import type { DCharacter } from '../../data';
import Image from '../image';

export default function CharacterImage({
	character,
	size = 50,
	...props
}: {
	character: DCharacter;
	size?: number;
} & BoxProps) {
	return (
		<Tooltip followCursor title={character.name}>
			<Box height={size} {...props}>
				<Image
					alt={character.name}
					width={size}
					height={size}
					src={character.image}
					className={`rarity${character.rarity}`}
					sx={{ borderRadius: 1 }}
				/>
			</Box>
		</Tooltip>
	);
}
