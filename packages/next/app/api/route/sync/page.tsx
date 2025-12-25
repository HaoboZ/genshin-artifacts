'use client';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import useParamState from '@/src/hooks/useParamState';
import { Box, Button, Grid, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import MapSelect from '../../../farming/mapSelect';
import RouteMap from '../../../farming/routeMap';
import { type Point, type Spot } from '../../../farming/routeMap/utils';
import VideoPlayer from '../../../farming/videoPlayer';
import { routesInfo } from '../../routes';
import { savePointsServer } from '../actions';
import TimePointControls from './timePointControls';

export default function RouteSyncTest() {
	const { enqueueSnackbar } = useSnackbar();

	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedRoute, setSelectedRoute] = useParamState('route', 0);
	const route = routesInfo[selectedRoute];
	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = route.maps[selectedMap].src;
	const [points, setPoints] = useFetchState<Point[]>(`/points/${mapName}.json`, []);
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
						<Stack direction='row' spacing={1}>
							<Select
								value={selectedRoute}
								onChange={({ target }) => {
									setSelectedRoute(target.value);
									setSelectedMap(0);
								}}>
								{routesInfo.map(({ spots, mora }, index) => (
									<MenuItem key={index} value={index}>
										Spots: {spots}, Mora: {mora}
									</MenuItem>
								))}
							</Select>
							<MapSelect
								route={route}
								selectedMap={selectedMap}
								setSelectedMap={setSelectedMap}
							/>
						</Stack>
						<Button
							variant='contained'
							onClick={async () => {
								await savePointsServer(points, mapName);
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
					src={mapName}
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
					src={mapName}
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
