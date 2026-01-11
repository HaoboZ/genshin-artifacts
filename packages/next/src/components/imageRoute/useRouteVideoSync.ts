import { useEffect, useRef, useState } from 'react';
import { useIntervalWhen, useVideo } from 'rooks';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function useRouteVideoSync(points: Point[], autoplay?: boolean) {
	const routeRef = useRef<HTMLDivElement>(null);
	const [videoRef, videoState, videoControls] = useVideo();

	const [showVideo, setShowVideo] = useState(false);
	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
	}, [points, time]);

	useEffect(() => {
		setShowVideo(false);
		videoControls.pause();
		videoControls.setCurrentTime(0);
		setTime(0);

		if (!points) return;
		if (!autoplay) {
			setShowVideo(true);
		} else {
			setTimeout(() => {
				setShowVideo(true);
				videoControls.play();
				videoControls.setCurrentTime(0);
			}, 2000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	useEffect(() => {
		if (!showVideo) return;
		setTime(videoState.currentTime);
	}, [showVideo, videoState.currentTime]);

	useIntervalWhen(
		() => setTime((time) => time + 0.016666666666666667),
		16.666666666666667,
		showVideo && !videoRef.current?.paused,
	);

	useEffect(() => {
		if (!videoRef.current) return;
		videoRef.current.style.opacity = showVideo ? '1' : '0';
	}, [showVideo, videoRef.current]);

	useEffect(() => {
		if (!routeRef.current) return;
		routeRef.current.style.opacity = points ? '1' : '0';
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points), routeRef.current]);

	return {
		routeRef,
		videoRef,
		time,
		setTime,
		activeSpot,
		setActiveSpot: (spot: Spot) => {
			setActiveSpot(spot);

			const calculatedTime = findTimeBySpot(points, spot);
			if (calculatedTime !== null) {
				setTime(calculatedTime);
				videoControls.setCurrentTime(calculatedTime);
			}
		},
	};
}
