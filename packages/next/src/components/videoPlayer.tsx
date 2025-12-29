import {
	FastForward as FastForwardIcon,
	FastRewind as FastRewindIcon,
	SkipNext as SkipNextIcon,
	SkipPrevious as SkipPreviousIcon,
} from '@mui/icons-material';
import { Box, type BoxProps, IconButton } from '@mui/material';
import { type RefObject, useState } from 'react';

const fps = 60;

export default function VideoPlayer({
	ref,
	src,
	seekFrames = 1,
	sx,
	...props
}: {
	ref: RefObject<HTMLVideoElement>;
	src: string;
	seekFrames?: number;
} & BoxProps) {
	const [isHovering, setIsHovering] = useState(false);

	const frameDuration = 1 / fps;

	const skipFrames = (frames: number) => {
		const video = ref.current;
		if (!video) return;

		const newTime = video.currentTime + frames * frameDuration;
		video.currentTime = Math.max(0, Math.min(newTime, video.duration));
	};

	return (
		<Box
			sx={{
				'position': 'relative',
				'& video::-webkit-media-controls, & video::-webkit-media-controls-enclosure': {
					opacity: isHovering ? 1 : 0,
					transition: 'opacity 0.3s ease',
				},
				...sx,
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			{...props}>
			<video
				ref={ref}
				controls
				src={`${process.env.NEXT_PUBLIC_BLOB_URL}/videos/${src}.mp4`}
				style={{ width: '100%', display: 'block' }}
			/>
			<Box
				sx={{
					'position': 'absolute',
					'top': 0,
					'left': 0,
					'right': 0,
					'bottom': 0,
					'display': 'flex',
					'alignItems': 'flex-end',
					'justifyContent': 'center',
					'gap': 1,
					'pb': 8,
					'pointerEvents': 'none',
					'opacity': isHovering ? 1 : 0,
					'transition': 'opacity 0.3s ease',
					'& .MuiIconButton-root': {
						'pointerEvents': 'auto',
						'bgcolor': 'rgba(0, 0, 0, 0.6)',
						'color': 'white',
						'&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
					},
				}}>
				<IconButton onClick={() => skipFrames(-5 * seekFrames)}>
					<FastRewindIcon />
				</IconButton>
				<IconButton onClick={() => skipFrames(-seekFrames)}>
					<SkipPreviousIcon />
				</IconButton>
				<IconButton onClick={() => skipFrames(seekFrames)}>
					<SkipNextIcon />
				</IconButton>
				<IconButton onClick={() => skipFrames(5 * seekFrames)}>
					<FastForwardIcon />
				</IconButton>
			</Box>
		</Box>
	);
}
