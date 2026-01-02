import Image from 'next/image';
import { type Dispatch, Fragment, type SetStateAction, useEffect, useState } from 'react';
import { useIntervalWhen, useVideo } from 'rooks';
import useControlledState from '../../hooks/useControlledState';
import VideoPlayer from '../videoPlayer';
import ImageRoute from './index';
import { type ImageRouteProps } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function ImageRouteSync({
	src,
	points,
	hidePoints,
	time: _time,
	setTime: _setTime,
	autoplay,
	seekFrames,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	sx,
	...props
}: {
	src: string;
	time?: number;
	setTime?: Dispatch<SetStateAction<number>>;
	autoplay?: boolean;
	seekFrames?: number;
} & ImageRouteProps) {
	const [videoRef, videoState, videoControls] = useVideo();

	const [hideVideo, setHideVideo] = useState(true);
	const [time, setTime] = useControlledState(_time, _setTime);
	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [playing, setPlaying] = useState(false);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, time]);

	useEffect(() => {
		setHideVideo(true);
		setPlaying(false);
	}, [src]);

	useEffect(() => {
		setTime(videoState.currentTime);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoState.currentTime]);

	useEffect(() => {
		setPlaying(!videoState.isPaused);
	}, [videoState.isPaused]);

	useIntervalWhen(
		() => setTime((time) => time + 0.016666666666666667),
		16.666666666666667,
		playing,
	);

	useEffect(() => {
		if (!points) return;
		if (!autoplay) {
			setHideVideo(false);
		} else {
			setTimeout(() => {
				setHideVideo(false);
				videoControls.play();
			}, 2000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	return (
		<Fragment>
			<ImageRoute
				points={points}
				hidePoints={hidePoints}
				activeSpot={activeSpot}
				setActiveSpot={(spot) => {
					setActiveSpot(spot);

					const calculatedTime = findTimeBySpot(points, spot);
					if (calculatedTime !== null) {
						setTime(calculatedTime);
						videoControls.setCurrentTime(calculatedTime);
					}
				}}
				initialZoom={0.8}
				sx={{
					position: 'absolute',
					width: '50%',
					aspectRatio: 1,
					right: 0,
					opacity: points ? 1 : 0,
					...sx,
				}}
				{...props}>
				<Image
					fill
					alt={src}
					src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/${src}.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
			<VideoPlayer
				ref={videoRef}
				src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/videos/${src}.mp4`}
				seekFrames={seekFrames}
				sx={{ position: 'absolute', bottom: 0, width: '50%', opacity: hideVideo ? 0 : 1 }}
			/>
		</Fragment>
	);
}
