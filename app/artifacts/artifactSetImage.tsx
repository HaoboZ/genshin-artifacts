import type { DArtifact } from '@/src/types/data';
import type { SlotKey } from '@/src/types/good';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip } from '@mui/joy';
import Image from 'next/image';

export default function ArtifactSetImage({
	artifactSet,
	slot,
	size = 100,
	...props
}: { artifactSet: DArtifact; slot?: SlotKey; size?: number } & BoxProps) {
	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Box width={size} height={size} overflow='hidden' borderRadius={size / 10} {...props}>
				<Image
					alt={artifactSet.name}
					src={artifactSet[slot] ?? artifactSet.flower ?? artifactSet.circlet}
					width={size}
					height={size}
					className={`rarity${artifactSet.rarity}`}
				/>
			</Box>
		</Tooltip>
	);
}
