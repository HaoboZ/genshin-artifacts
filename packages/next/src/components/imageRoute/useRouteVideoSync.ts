import { useEffect, useRef, useState } from 'react';
import { useVideo } from 'rooks';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function useRouteVideoSync(points: Point[]) {
	const routeRef = useRef<HTMLDivElement>(null);
	const [videoRef, videoState, videoControls] = useVideo();
	const animationFrameRef = useRef<number>(null);

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
		const updateTime = () => {
			if (videoRef.current && !videoState.isPaused) {
				setTime(videoRef.current.currentTime);
			}
			animationFrameRef.current = requestAnimationFrame(updateTime);
		};

		if (!videoState.isPaused) {
			animationFrameRef.current = requestAnimationFrame(updateTime);
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [videoRef, videoState.isPaused]);

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
