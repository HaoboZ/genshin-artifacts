import {
	type Dispatch,
	Fragment,
	type RefObject,
	type SetStateAction,
	useEffect,
	useState,
} from 'react';
import useControlledState from '../../hooks/useControlledState';
import useEventListener from '../../hooks/useEventListener';
import VideoPlayer from '../videoPlayer';
import ImageRoute from './index';
import { type ImageRouteProps } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

const fps = 60;

export default function ImageRouteSync({
	videoRef,
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
	videoRef: RefObject<HTMLVideoElement>;
	time?: number;
	setTime?: Dispatch<SetStateAction<number>>;
	autoplay?: boolean;
	seekFrames?: number;
} & ImageRouteProps) {
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

	useEventListener(videoRef.current, 'play', () => {
		setTime(videoRef.current.currentTime);
		setPlaying(true);
	});

	useEventListener(videoRef.current, 'pause', () => {
		setTime(videoRef.current.currentTime);
		setPlaying(false);
	});

	useEffect(() => {
		if (!playing) return;
		const interval = setInterval(() => {
			setTime((time) => time + 1 / fps);
		}, 1000 / fps);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playing]);

	return (
		<Fragment>
			<ImageRoute
				src={src}
				points={points}
				hidePoints={hidePoints}
				onLoaded={() => {
					if (!autoplay) {
						setHideVideo(false);
					} else {
						setTimeout(() => {
							setHideVideo(false);
							videoRef.current?.play();
						}, 2000);
					}
				}}
				activeSpot={activeSpot}
				setActiveSpot={(spot) => {
					setActiveSpot(spot);

					const calculatedTime = findTimeBySpot(points, spot);
					if (calculatedTime !== null) {
						setTime(calculatedTime);
						videoRef.current.currentTime = calculatedTime;
					}
				}}
				sx={{ position: 'absolute', width: '50%', aspectRatio: 1, right: 0, ...sx }}
				{...props}
			/>
			<VideoPlayer
				ref={videoRef}
				src={src}
				seekFrames={seekFrames}
				sx={{
					position: 'absolute',
					bottom: 0,
					width: '55%',
					opacity: hideVideo ? 0 : undefined,
				}}
			/>
		</Fragment>
	);
}
