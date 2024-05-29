import { artifactSetsInfo, artifactSlotImages } from '@/api/artifacts';
import type { IArtifact, SlotKey } from '@/src/types/good';
import type { BoxProps } from '@mui/joy';
import { Box, Tooltip, Typography } from '@mui/joy';
import Image from 'next/image';

export default function ArtifactImage({
	artifact,
	slot,
	size = 100,
	children,
	...props
}: { artifact: IArtifact; slot?: SlotKey; size?: number } & BoxProps) {
	const artifactSet = artifactSetsInfo[artifact?.setKey];

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
					alt={artifactSet?.name ?? slot ?? 'artifact'}
					src={artifactSet?.[artifact?.slotKey ?? slot] ?? artifactSlotImages[slot]}
					width={size}
					height={size}
					className={`rarity${artifact?.rarity ?? artifactSet?.rarity}`}
				/>
				{artifact && (
					<Typography position='absolute' top={0} left={0}>
						&nbsp;{artifact.level}
					</Typography>
				)}
				{children}
			</Box>
		</Tooltip>
	);
}
