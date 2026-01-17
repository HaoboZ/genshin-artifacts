import { useEffect, useRef, useState } from 'react';
import { useIntervalWhen, useVideo } from 'rooks';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function useRouteVideoSync(points: Point[]) {
	const routeRef = useRef<HTMLDivElement>(null);
	const [videoRef, videoState, videoControls] = useVideo();

	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
	}, [points, time]);

	useEffect(() => {
		videoControls.pause();
		videoControls.setCurrentTime(0);
		setTime(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	useEffect(() => {
		setTime(videoState.currentTime);
	}, [videoState.currentTime]);

	useIntervalWhen(
		() => setTime((time) => time + 0.016666666666666667),
		16.666666666666667,
		!videoState.isPaused,
	);

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
