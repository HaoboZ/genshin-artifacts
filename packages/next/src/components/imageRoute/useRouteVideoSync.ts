import { useEffect, useRef, useState } from 'react';
import { useIntervalWhen, useVideo } from 'rooks';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function useRouteVideoSync(points: Point[], autoplay?: boolean) {
	const routeRef = useRef<HTMLDivElement>(null);
	const [videoRef, videoState, videoControls] = useVideo();

	const [hideVideo, setShowVideo] = useState(false);
	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);
	const [playing, setPlaying] = useState(false);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
	}, [points, time]);

	useEffect(() => {
		setShowVideo(false);
		setPlaying(false);

		if (!points) return;
		if (!autoplay) {
			setShowVideo(true);
		} else {
			setTimeout(() => {
				setShowVideo(true);
				videoControls.play();
			}, 2000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	useEffect(() => {
		setTime(videoState.currentTime);
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
		if (!videoRef.current) return;
		videoRef.current.style.opacity = hideVideo ? '1' : '0';
	}, [hideVideo, videoRef]);

	useEffect(() => {
		if (!routeRef.current) return;
		routeRef.current.style.opacity = points ? '1' : '0';
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points), routeRef]);

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
