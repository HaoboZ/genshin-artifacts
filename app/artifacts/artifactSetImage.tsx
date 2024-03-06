import type { DArtifact } from '@/src/types/data';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';

export default function ArtifactSetImage({
	artifactSet,
	size = 100,
	children,
	...props
}: { artifactSet: DArtifact; size?: number } & BoxProps) {
	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Box
				width={size}
				height={size}
				overflow='hidden'
				borderRadius={size / 10}
				position='relative'
				{...props}>
				<Image
					alt={artifactSet.name}
					src={artifactSet.flower ?? artifactSet.circlet}
					width={size}
					height={size}
					className={`rarity${artifactSet.rarity}`}
				/>
				{children}
			</Box>
		</Tooltip>
	);
}
