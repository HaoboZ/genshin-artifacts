'use client';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import useParamState from '@/src/hooks/useParamState';
import { Box, Button, Grid, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import RouteMap from '../../../farming/routeMap';
import { Point, Spot } from '../../../farming/routeMap/utils';
import VideoPlayer from '../../../farming/videoPlayer';
import route from '../../route.json';
import { savePointsServer } from '../actions';
import TimePointControls from './timePointControls';

const maps = route[0].maps;

export default function RouteSyncTest() {
	const { enqueueSnackbar } = useSnackbar();

	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedRoute, setSelectedRoute] = useParamState<string>('route', maps[0]);
	const [points, setPoints] = useFetchState<Point[]>(`/points/${selectedRoute}.json`, []);
	const [time, setTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

	useEventListener(
		// eslint-disable-next-line react-hooks/refs
		videoRef.current,
		'loadedmetadata',
		() => setDuration(videoRef.current.duration),
		true,
	);

	const updatePointField = (index: number, field: string, value: number) => {
		setPoints((prevPoints) => {
			const newPoints = [...prevPoints];
			if (index >= 0 && index < newPoints.length) {
				const updatedPoint = { ...newPoints[index] };
				if (value === undefined) {
					delete updatedPoint[field];
				} else {
					updatedPoint[field] = value;
				}
				newPoints[index] = updatedPoint;
			}
			return newPoints;
		});
	};

	const currentIndex = maps.indexOf(selectedRoute);
	const currentPointIndex = activeSpot?.pointIndex ?? null;
	const nextPointIndex = currentPointIndex !== null ? currentPointIndex + 1 : null;

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Box
				sx={{
					width: '100%',
					maxWidth: 'calc(100vh * 16 / 9)',
					aspectRatio: '16 / 9',
					display: 'grid',
					gridTemplate: '1fr 1fr',
				}}>
				<Box
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'start',
						alignSelf: 'start',
						width: '50%',
						maxHeight: '100%',
						overflow: 'auto',
					}}>
					<Stack spacing={1} sx={{ p: 1 }}>
						<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
							<Button
								variant='outlined'
								onClick={() => {
									if (currentIndex <= 0) return;
									setSelectedRoute(maps[currentIndex - 1]);
								}}
								disabled={currentIndex <= 0}>
								Previous
							</Button>
							<Select
								value={selectedRoute}
								onChange={({ target }) => setSelectedRoute(target.value)}>
								{maps.map((routeName) => (
									<MenuItem key={routeName} value={routeName}>
										{routeName}
									</MenuItem>
								))}
							</Select>
							<Button
								variant='outlined'
								onClick={() => {
									if (currentIndex >= maps.length - 1) return;
									setSelectedRoute(maps[currentIndex + 1]);
								}}
								disabled={currentIndex >= maps.length - 1}>
								Next
							</Button>
						</Stack>
						<Button
							variant='contained'
							onClick={async () => {
								await savePointsServer(points, selectedRoute);
								enqueueSnackbar('Saved', { variant: 'info' });
							}}>
							Save Points
						</Button>
						<Typography variant='body2' sx={{ mt: 1 }}>
							Current Time: {time.toFixed(2)}s
						</Typography>
						<Grid container>
							<TimePointControls
								name='Previous'
								time={time}
								point={
									currentPointIndex !== null && currentPointIndex >= 0
										? points[currentPointIndex]
										: null
								}
								pointIndex={currentPointIndex}
								updatePointField={updatePointField}
							/>
							<TimePointControls
								name='Current'
								time={time}
								point={
									nextPointIndex !== null && nextPointIndex < points.length
										? points[nextPointIndex]
										: null
								}
								pointIndex={nextPointIndex}
								updatePointField={updatePointField}
							/>
						</Grid>
					</Stack>
				</Box>
				<RouteMap
					src={selectedRoute}
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'end',
						alignSelf: 'start',
						width: '50%',
					}}
				/>
				<VideoPlayer
					ref={videoRef}
					src={selectedRoute}
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'start',
						alignSelf: 'end',
						width: '55%',
						position: 'relative',
					}}
				/>
				<Box
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'end',
						alignSelf: 'end',
						width: '45%',
						p: 1,
					}}>
					<Stack>
						<Stack direction='row' spacing={1} alignItems='center'>
							<Typography variant='caption' sx={{ minWidth: 80 }}>
								Scrub
							</Typography>
							<Slider
								value={time}
								min={0}
								step={0.1}
								max={duration || 100}
								onChange={(_, value) => {
									const video = videoRef.current;
									if (!video) return;
									video.currentTime = value;
									setTime(value);
								}}
							/>
						</Stack>
						<Stack direction='row' spacing={1} alignItems='center'>
							<Typography variant='caption' sx={{ minWidth: 80 }}>
								Speed: {playbackRate.toFixed(2)}x
							</Typography>
							<Slider
								value={playbackRate}
								min={0.25}
								max={2}
								step={0.05}
								onChange={(_, value) => {
									const video = videoRef.current;
									if (!video) return;
									video.playbackRate = value;
									setPlaybackRate(value);
								}}
							/>
						</Stack>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}
