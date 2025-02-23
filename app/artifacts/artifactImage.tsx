import { artifactSetsInfo, artifactSlotImages } from '@/api/artifacts';
import type { IArtifact, SlotKey } from '@/src/types/good';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';

export default function ArtifactImage({
	artifact,
	slot,
	size = 100,
	children,
	...props
}: { artifact: IArtifact; slot?: SlotKey; size?: number } & AvatarProps) {
	const artifactSet = artifactSetsInfo[artifact?.setKey];

	return (
		<Tooltip followCursor title={artifactSet?.name}>
			<Avatar
				variant='rounded'
				{...props}
				sx={{
					width: size,
					height: size,
					overflow: 'hidden',
					position: 'relative',
					...props.sx,
				}}>
				<Image
					alt={artifactSet?.name ?? slot ?? 'artifact'}
					src={artifactSet?.[artifact?.slotKey ?? slot] ?? artifactSlotImages[slot]}
					width={size}
					height={size}
					className={`rarity${artifact?.rarity ?? artifactSet?.rarity}`}
				/>
				{artifact && (
					<Typography
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							bgcolor: 'white',
							borderRadius: 1,
							opacity: 0.75,
						}}>
						&nbsp;{artifact.level}&nbsp;
					</Typography>
				)}
				{children}
			</Avatar>
		</Tooltip>
	);
}
