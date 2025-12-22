'use client';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
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

	const [currentRoute, setCurrentRoute] = useState(maps[0]);
	const [points, setPoints] = useFetchState<Point[]>(`/points/${currentRoute}.json`, []);
	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	const currentIndex = maps.indexOf(currentRoute);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => {
		setTime(videoRef.current.currentTime);
	});

	const updatePointTime = (index: number, field: 'start' | 'end', value: number | undefined) => {
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
						<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
							<Button
								variant='outlined'
								onClick={() => {
									if (currentIndex <= 0) return;
									setCurrentRoute(maps[currentIndex - 1]);
								}}
								disabled={currentIndex <= 0}>
								Previous
							</Button>
							<Select
								value={currentRoute}
								onChange={({ target }) => setCurrentRoute(target.value)}>
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
									setCurrentRoute(maps[currentIndex + 1]);
								}}
								disabled={currentIndex >= maps.length - 1}>
								Next
							</Button>
						</Stack>
						<Button
							variant='contained'
							onClick={async () => {
								await savePointsServer(points, currentRoute);
								enqueueSnackbar('Saved', { variant: 'info' });
							}}>
							Save Points
						</Button>
						<Typography variant='body2' sx={{ mt: 1 }}>
							Current Time: {time.toFixed(2)}s
						</Typography>
						<TimePointControls
							time={time}
							point={
								currentPointIndex !== null && currentPointIndex >= 0
									? points[currentPointIndex]
									: null
							}
							pointIndex={currentPointIndex}
							updatePointTime={updatePointTime}
						/>
						<TimePointControls
							time={time}
							point={
								nextPointIndex !== null && nextPointIndex < points.length
									? points[nextPointIndex]
									: null
							}
							pointIndex={nextPointIndex}
							updatePointTime={updatePointTime}
						/>
					</Stack>
				</Box>
				<RouteMap
					src={currentRoute}
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
					src={currentRoute}
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'start',
						alignSelf: 'end',
						width: '55%',
					}}
				/>
			</Box>
		</Box>
	);
}
