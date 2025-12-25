'use client';
import {
	FastForward as FastForwardIcon,
	FastRewind as FastRewindIcon,
	Pause as PauseIcon,
	PlayArrow as PlayArrowIcon,
	SkipNext as SkipNextIcon,
	SkipPrevious as SkipPreviousIcon,
} from '@mui/icons-material';
import { Box, type BoxProps } from '@mui/material';
import React, { type RefObject, useState } from 'react';

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
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlay = () => {
		const video = ref.current;
		if (!video) return;

		if (video.paused) {
			video.play();
			setIsPlaying(true);
		} else {
			video.pause();
			setIsPlaying(false);
		}
	};

	const seekByFrames = (frames: number) => {
		const video = ref.current;
		if (!video) return;

		const frameRate = 60;
		const timePerFrame = 1 / frameRate;
		const seekTime = frames * timePerFrame;
		video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seekTime));
	};

	return (
		<Box
			sx={{
				'position': 'relative',
				'&:hover .video-overlay': { opacity: 1 },
				...sx,
			}}
			{...props}>
			<video
				ref={ref}
				controls={false}
				src={`/videos/${src}.mp4`}
				style={{ width: '100%', display: 'block' }}
				onEnded={() => setIsPlaying(false)}
			/>
			<Box
				className='video-overlay'
				sx={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: 0,
					containerType: 'inline-size',
					transition: 'opacity 100ms ease-in-out',
				}}>
				<Box
					sx={{
						'display': 'flex',
						'alignItems': 'center',
						'.MuiBox-root': {
							display: 'flex',
							cursor: 'pointer',
						},
						'.MuiSvgIcon-root': {
							'opacity': 0.5,
							'&:hover': { opacity: 0.75 },
						},
					}}>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(-seekFrames * 5);
						}}>
						<FastRewindIcon sx={{ fontSize: '8cqw' }} />
					</Box>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(-seekFrames);
						}}>
						<SkipPreviousIcon sx={{ fontSize: '10cqw' }} />
					</Box>
					{isPlaying ? (
						<PauseIcon sx={{ fontSize: '15cqw' }} onClick={togglePlay} />
					) : (
						<PlayArrowIcon sx={{ fontSize: '15cqw' }} onClick={togglePlay} />
					)}
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(seekFrames);
						}}>
						<SkipNextIcon sx={{ fontSize: '10cqw' }} />
					</Box>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(seekFrames * 5);
						}}>
						<FastForwardIcon sx={{ fontSize: '8cqw' }} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
