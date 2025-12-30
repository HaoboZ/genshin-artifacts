import { type BoxProps } from '@mui/material';
import {
	type ComponentType,
	type Dispatch,
	Fragment,
	type RefObject,
	useEffect,
	useState,
} from 'react';
import useControlledState from '../../hooks/useControlledState';
import VideoPlayer from '../videoPlayer';
import ImageRoute from './index';
import { type Point, type RenderPathProps, type RenderPointProps, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function ImageRouteSync({
	videoRef,
	src,
	points,
	hidePoints,
	time,
	setTime,
	autoplay,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	extraSpot,
	...props
}: {
	videoRef: RefObject<HTMLVideoElement>;
	src: string;
	points: Point[];
	hidePoints?: boolean;
	time: number;
	setTime: Dispatch<number>;
	autoplay?: boolean;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
	extraSpot?: Spot;
	RenderPoint?: ComponentType<RenderPointProps>;
	RenderPath?: ComponentType<RenderPathProps>;
} & BoxProps) {
	const [hideVideo, setHideVideo] = useState(true);
	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, time]);

	useEffect(() => {
		setHideVideo(true);
	}, [src]);

	return (
		<Fragment>
			<ImageRoute
				src={src}
				points={points}
				hidePoints={hidePoints}
				onLoaded={() => {
					if (!autoplay) {
						setHideVideo(false);
						return;
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
					if (calculatedTime !== null) setTime(calculatedTime);
				}}
				extraSpot={extraSpot}
				{...props}
			/>
			<VideoPlayer
				ref={videoRef}
				src={src}
				sx={{
					gridColumn: 1,
					gridRow: 1,
					justifySelf: 'start',
					alignSelf: 'end',
					width: '55%',
					opacity: hideVideo ? 0 : undefined,
				}}
			/>
		</Fragment>
	);
}
