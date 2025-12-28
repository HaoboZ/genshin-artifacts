'use client';
import ImageRoutePathSync from '@/components/imageRoute/imageRouteSync';
import { type Point, type Spot } from '@/components/imageRoute/types';
import VideoPlayer from '@/components/videoPlayer';
import useEventListener from '@/hooks/useEventListener';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import {
	Box,
	Button,
	Container,
	Grid,
	MenuItem,
	Select,
	Slider,
	Stack,
	Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo, useRef, useState } from 'react';
import { pick } from 'remeda';
import PathSelect from '../../../farming/[route]/pathSelect';
import { RouteMarker, RouteRenderPath, RouteRenderPoint } from '../../../farming/[route]/render';
import { routesInfo } from '../../routes';
import { savePointsServer } from '../actions';
import TimePointControls from './timePointControls';

export default function InternalRouteSync() {
	const { enqueueSnackbar } = useSnackbar();

	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedRoute, setSelectedRoute] = useState(0);
	const route = routesInfo[selectedRoute];
	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = route.maps[selectedMap].src;
	const [points, setPoints] = useFetchState<Point[]>(`/points/${mapName}.json`, []);
	const [time, setTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [volume, setVolume] = useState(1);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

	useEventListener(
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

	// calculate spots collected at current time
	const spots = useMemo(
		() =>
			route.maps[selectedMap].start +
			(points?.filter((point) => (!point.marked ? false : time >= point.marked)).length ?? 0),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedRoute, selectedMap, points, time],
	);

	return (
		<Container>
			<Stack direction='row' spacing={1}>
				<Select
					value={selectedRoute}
					onChange={({ target }) => {
						setSelectedRoute(target.value);
						setSelectedMap(0);
						setPoints([]);
					}}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Spots: {spots}, Mora: {mora}
						</MenuItem>
					))}
				</Select>
				<PathSelect
					route={route}
					selectedMap={selectedMap}
					setSelectedMap={(selectedMap) => {
						setSelectedMap(selectedMap);
						setPoints([]);
					}}
				/>
			</Stack>
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
							<Button
								variant='contained'
								onClick={async () => {
									await savePointsServer(points, mapName);
									enqueueSnackbar('Saved', { variant: 'info' });
								}}>
								Save Points
							</Button>
							<Typography variant='body2' sx={{ mt: 1 }}>
								Current Time: {time.toFixed(2)}s; Spots: {spots}
							</Typography>
							<Stack direction='row' spacing={1}>
								<Button
									variant='contained'
									size='small'
									disabled={currentPointIndex <= 0}
									onClick={() => {
										setActiveSpot({
											point: points[currentPointIndex - 1],
											pointIndex: currentPointIndex - 1,
											percentage: 0,
										});
									}}>
									Prev Point
								</Button>
								<Button
									variant='contained'
									size='small'
									disabled={nextPointIndex + 1 >= points?.length}
									onClick={() => {
										setActiveSpot({
											point: points[currentPointIndex + 1],
											pointIndex: currentPointIndex + 1,
											percentage: 0,
										});
									}}>
									Next Point
								</Button>
								<Button
									variant='contained'
									size='small'
									onClick={() => {
										setPoints((points) => {
											const newPoints = [...points];
											newPoints.splice(
												nextPointIndex,
												0,
												pick(activeSpot.point, ['x', 'y']),
											);
											return newPoints;
										});
									}}>
									Duplicate
								</Button>
							</Stack>
							<Grid container>
								<TimePointControls
									name='Current'
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
									name='Next'
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
					<ImageRoutePathSync
						src={mapName}
						points={points}
						time={time}
						setTime={(time) => {
							setTime(time);
							if (!videoRef.current) return;
							videoRef.current.currentTime = time;
						}}
						activeSpot={activeSpot}
						setActiveSpot={setActiveSpot}
						RenderPoint={RouteRenderPoint}
						RenderPath={RouteRenderPath}
						sx={{
							gridColumn: 1,
							gridRow: 1,
							justifySelf: 'end',
							alignSelf: 'start',
							width: '50%',
							aspectRatio: 1,
						}}>
						<RouteMarker />
					</ImageRoutePathSync>
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
									step={1 / 15}
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
								<Typography variant='caption' sx={{ minWidth: 80 }}>
									Volume: {volume * 100}%
								</Typography>
								<Slider
									value={volume}
									min={0}
									max={1}
									step={0.05}
									onChange={(_, value) => {
										const video = videoRef.current;
										if (!video) return;
										video.volume = value;
										setVolume(value);
									}}
								/>
							</Stack>
						</Stack>
					</Box>
				</Box>
			</Box>
		</Container>
	);
}
