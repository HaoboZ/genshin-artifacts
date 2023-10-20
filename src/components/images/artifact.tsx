import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import type { DArtifact } from '../../data';
import type { IArtifact, SlotKey } from '../../good';
import { data } from '../../resources/data';

const images = {
	flower: 'https://static.wikia.nocookie.net/gensin-impact/images/2/2d/Icon_Flower_of_Life.png',
	plume: 'https://static.wikia.nocookie.net/gensin-impact/images/8/8b/Icon_Plume_of_Death.png',
	sands: 'https://static.wikia.nocookie.net/gensin-impact/images/9/9f/Icon_Sands_of_Eon.png',
	goblet:
		'https://static.wikia.nocookie.net/gensin-impact/images/3/37/Icon_Goblet_of_Eonothem.png',
	circlet: 'https://static.wikia.nocookie.net/gensin-impact/images/6/64/Icon_Circlet_of_Logos.png',
};

export default function ArtifactImage({
	artifact,
	hideCharacter,
	hideLevel,
	artifactSet,
	type,
	size = 50,
	sx,
	...props
}: {
	artifact?: IArtifact;
	hideCharacter?: boolean;
	hideLevel?: boolean;
	artifactSet?: DArtifact;
	type?: SlotKey;
	size?: number;
} & AvatarProps) {
	let character;
	if (artifact) {
		artifactSet = data.artifacts[artifact.setKey];
		type = artifact.slotKey;
		if (!hideCharacter) character = data.characters[artifact.location];
	}
	const scale = size * 0.4;
	const offset = size * 0.6;

	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Avatar
				variant='rounded'
				sx={{ width: size, height: size, position: 'relative', ...sx }}
				{...props}>
				<Image
					alt={artifactSet?.name ?? 'artifact'}
					src={artifactSet?.[type] ?? artifactSet?.circlet ?? images[type]}
					width={size}
					height={size}
					className={`rarity${artifact?.rarity ?? artifactSet?.rarity}`}
				/>
				{!hideLevel && artifact && (
					<Typography position='absolute' top={0} left={0}>
						&nbsp;{artifact.level}
					</Typography>
				)}
				{character && (
					<Avatar
						variant='rounded'
						sx={{
							width: scale,
							height: scale,
							position: 'absolute',
							left: offset,
							top: offset,
							border: 1,
							borderColor: 'white',
						}}>
						<Image
							alt={character.name}
							width={scale}
							height={scale}
							src={character.image}
							className={`rarity${character.rarity}`}
						/>
					</Avatar>
				)}
			</Avatar>
		</Tooltip>
	);
}
