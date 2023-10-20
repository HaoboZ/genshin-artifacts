import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip } from '@mui/material';
import Image from 'next/image';
import type { DCharacter } from '../../data';

export default function CharacterImage({
	character,
	size = 50,
	sx,
	...props
}: {
	character: DCharacter;
	size?: number;
} & AvatarProps) {
	return (
		<Tooltip followCursor title={character.name}>
			<Avatar variant='rounded' sx={{ width: size, height: size, ...sx }} {...props}>
				<Image
					alt={character.name}
					width={size}
					height={size}
					src={character.image}
					className={`rarity${character.rarity}`}
				/>
			</Avatar>
		</Tooltip>
	);
}
