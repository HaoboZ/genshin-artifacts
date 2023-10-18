import type { SxProps } from '@mui/material';
import type { DArtifact } from '../../data';
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
	type,
	size = 50,
	sx,
}: {
	artifact: DArtifact;
	type?: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
	size?: number;
	sx?: SxProps;
}) {
	return (
		<Image
			alt={artifact?.name ?? 'artifact'}
			src={artifact?.[type] ?? artifact?.circlet ?? images[type]}
			width={size}
			height={size}
			className={`rarity${artifact?.rarity}`}
			sx={{ borderRadius: 1, ...sx }}
		/>
	);
}
