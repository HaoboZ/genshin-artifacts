'use client';
import {
	FastForward as FastForwardIcon,
	FastRewind as FastRewindIcon,
	Pause as PauseIcon,
	PlayArrow as PlayArrowIcon,
	SkipNext as SkipNextIcon,
	SkipPrevious as SkipPreviousIcon,
} from '@mui/icons-material';
import { Box, BoxProps } from '@mui/material';
import React, { RefObject, useState } from 'react';

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
				'cursor': 'pointer',
				'&:hover .video-overlay': { opacity: 1 },
				...sx,
			}}
			onClick={togglePlay}
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
						display: 'flex',
						alignItems: 'center',
						gap: 2,
					}}>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(-seekFrames * 5);
						}}
						sx={{
							'cursor': 'pointer',
							'display': 'flex',
							'alignItems': 'center',
							'&:hover': { opacity: 0.7 },
						}}>
						<FastRewindIcon sx={{ fontSize: '8cqw' }} />
					</Box>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(-seekFrames);
						}}
						sx={{
							'cursor': 'pointer',
							'display': 'flex',
							'alignItems': 'center',
							'&:hover': { opacity: 0.7 },
						}}>
						<SkipPreviousIcon sx={{ fontSize: '10cqw' }} />
					</Box>
					{isPlaying ? (
						<PauseIcon sx={{ fontSize: '15cqw' }} />
					) : (
						<PlayArrowIcon sx={{ fontSize: '15cqw' }} />
					)}
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(seekFrames);
						}}
						sx={{
							'cursor': 'pointer',
							'display': 'flex',
							'alignItems': 'center',
							'&:hover': { opacity: 0.7 },
						}}>
						<SkipNextIcon sx={{ fontSize: '10cqw' }} />
					</Box>
					<Box
						onClick={(e) => {
							e.stopPropagation();
							seekByFrames(seekFrames * 5);
						}}
						sx={{
							'cursor': 'pointer',
							'display': 'flex',
							'alignItems': 'center',
							'&:hover': { opacity: 0.7 },
						}}>
						<FastForwardIcon sx={{ fontSize: '8cqw' }} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
