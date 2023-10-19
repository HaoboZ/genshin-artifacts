import type { BoxProps } from '@mui/material';
import { Box, Tooltip, Typography } from '@mui/material';
import type { DArtifact } from '../../data';
import type { IArtifact } from '../../good';
import { data } from '../../resources/data';
import Image from '../image';

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
	artifactSet,
	type,
	size = 50,
	...props
}: {
	artifact?: IArtifact;
	hideCharacter?: boolean;
	artifactSet?: DArtifact;
	type?: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
	size?: number;
} & BoxProps) {
	let character;
	if (artifact) {
		artifactSet = data.artifacts[artifact.setKey];
		type = artifact.slotKey;
		if (!hideCharacter) character = data.characters[artifact.location];
	}

	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Box height={size} position='relative' {...props}>
				<Image
					alt={artifactSet?.name ?? 'artifact'}
					src={artifactSet?.[type] ?? artifactSet?.circlet ?? images[type]}
					width={size}
					height={size}
					className={`rarity${artifact?.rarity ?? artifactSet?.rarity}`}
					sx={{ borderRadius: 1 }}
				/>
				{artifact && (
					<Typography position='absolute' top={0} left={0}>
						&nbsp;{artifact.level}
					</Typography>
				)}
				{character && (
					<Image
						alt={character.name}
						src={character.image}
						width={size * 0.4}
						height={size * 0.4}
						sx={{ position: 'absolute', left: size * 0.6, top: size * 0.6 }}
					/>
				)}
			</Box>
		</Tooltip>
	);
}
