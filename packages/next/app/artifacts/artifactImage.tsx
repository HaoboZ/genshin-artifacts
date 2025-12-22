import { artifactSetsInfo, artifactSlotImages } from '@/api/artifacts';
import OverlayText from '@/components/overlayText';
import type { IArtifact, SlotKey } from '@/src/types/good';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip } from '@mui/material';
import Image from 'next/image';

export default function ArtifactImage({
	artifact,
	slot,
	size = 100,
	children,
	sx,
	...props
}: { artifact: IArtifact; slot?: SlotKey; size?: number } & AvatarProps) {
	const artifactSet = artifactSetsInfo[artifact?.setKey];

	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Avatar
				variant='rounded'
				sx={{
					width: size,
					height: size,
					overflow: 'hidden',
					position: 'relative',
					...sx,
				}}
				{...props}>
				<Image
					alt={artifactSet?.name ?? slot ?? 'artifact'}
					src={artifactSet?.[artifact?.slotKey ?? slot] ?? artifactSlotImages[slot]}
					width={size}
					height={size}
					className={`rarity${artifact?.rarity ?? artifactSet?.rarity}`}
				/>
				{artifact && <OverlayText>{artifact.level}</OverlayText>}
				{children}
			</Avatar>
		</Tooltip>
	);
}
