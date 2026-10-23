import { Avatar, type AvatarProps, Tooltip } from '@mui/material';
import Image from 'next/image';
import { type ReactNode } from 'react';

import { type DArtifact } from '@/types/data';

export default function ArtifactSetImage({
	artifactSet,
	size = 100,
	tooltip,
	children,
	sx,
	...props
}: { artifactSet: DArtifact; size?: number; tooltip?: ReactNode } & AvatarProps) {
	return (
		<Tooltip followCursor title={tooltip ?? artifactSet?.name}>
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
					alt={artifactSet.name}
					src={artifactSet.flower ?? artifactSet.circlet}
					referrerPolicy='no-referrer'
					width={size}
					height={size}
					className={`rarity${artifactSet.rarity}`}
				/>
				{children}
			</Avatar>
		</Tooltip>
	);
}
