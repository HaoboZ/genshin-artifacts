import type { SxProps } from '@mui/material';
import type { DCharacter } from '../../data';
import Image from '../image';

export default function CharacterImage({
	character,
	size = 50,
	sx,
}: {
	character: DCharacter;
	size?: number;
	sx?: SxProps;
}) {
	return (
		<Image
			alt={character.name}
			width={size}
			height={size}
			src={character.image}
			className={`rarity${character.rarity}`}
			sx={sx}
		/>
	);
}
