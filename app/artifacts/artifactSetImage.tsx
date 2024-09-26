import type { DArtifact } from '@/src/types/data';
import type { AvatarProps } from '@mui/material';
import { Avatar, Tooltip } from '@mui/material';
import Image from 'next/image';
import type { ReactNode } from 'react';

export default function ArtifactSetImage({
	artifactSet,
	size = 100,
	tooltip,
	children,
	...props
}: { artifactSet: DArtifact; size?: number; tooltip?: ReactNode } & AvatarProps) {
	return (
		<Tooltip followCursor title={tooltip ?? artifactSet?.name}>
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
					alt={artifactSet.name}
					src={artifactSet.flower ?? artifactSet.circlet}
					width={size}
					height={size}
					className={`rarity${artifactSet.rarity}`}
				/>
				{children}
			</Avatar>
		</Tooltip>
	);
}
