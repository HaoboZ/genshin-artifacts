import { useCallback, useEffect, useRef, useState } from 'react';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

type YoutubePlayerLike = {
	getCurrentTime?: () => number;
	seekTo?: (time: number, allowSeekAhead?: boolean) => void;
	pauseVideo?: () => void;
};

type YoutubePlayerReadyEvent = {
	target: YoutubePlayerLike;
};

type YoutubePlayerStateChangeEvent = {
	data: number;
	target: YoutubePlayerLike;
};

const PLAYER_STATE = {
	UNSTARTED: -1,
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
	BUFFERING: 3,
	CUED: 5,
};

export default function useRouteYoutubeSync(points: Point[]) {
	const routeRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<YoutubePlayerLike>(null);
	const animationFrameRef = useRef<number>(null);
	const lastTimeRef = useRef<number>(0);
	const isPlayingRef = useRef(false);

	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	// Sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
	}, [points, time]);

	useEffect(() => {
		const player = playerRef.current;
		player?.pauseVideo?.();
		player?.seekTo?.(0, true);
		lastTimeRef.current = 0;
		setTime(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	const syncTimeFromPlayer = useCallback((player: YoutubePlayerLike) => {
		const currentTime = player?.getCurrentTime?.();
		if (Number.isFinite(currentTime) && currentTime !== lastTimeRef.current) {
			lastTimeRef.current = currentTime;
			setTime(currentTime);
		}
	}, []);

	const onPlayerReady = useCallback(
		(event: YoutubePlayerReadyEvent) => {
			playerRef.current = event.target;
			syncTimeFromPlayer(event.target);
		},
		[syncTimeFromPlayer],
	);

	const onPlayerStateChange = useCallback(
		(event: YoutubePlayerStateChangeEvent) => {
			const isPlaying = event.data === PLAYER_STATE.PLAYING;
			isPlayingRef.current = isPlaying;

			if (isPlaying) {
				if (animationFrameRef.current) return;
				const updateTime = () => {
					if (!isPlayingRef.current) {
						if (animationFrameRef.current) {
							cancelAnimationFrame(animationFrameRef.current);
						}
						animationFrameRef.current = null;
						return;
					}
					syncTimeFromPlayer(playerRef.current);
					animationFrameRef.current = requestAnimationFrame(updateTime);
				};

				animationFrameRef.current = requestAnimationFrame(updateTime);
			} else {
				syncTimeFromPlayer(event.target);
			}
		},
		[syncTimeFromPlayer],
	);

	return {
		routeRef,
		playerRef,
		time,
		setTime: (nextTime: number) => {
			lastTimeRef.current = nextTime;
			setTime(nextTime);
			playerRef.current?.seekTo?.(nextTime, true);
		},
		activeSpot,
		setActiveSpot: (spot: Spot) => {
			setActiveSpot(spot);

			const calculatedTime = findTimeBySpot(points, spot);
			if (calculatedTime !== null) {
				lastTimeRef.current = calculatedTime;
				setTime(calculatedTime);
				playerRef.current?.seekTo?.(calculatedTime, true);
			}
		},
		onPlayerReady,
		onPlayerStateChange,
	};
}
