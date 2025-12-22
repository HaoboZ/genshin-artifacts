'use client';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import { Box, Button, MenuItem, Select, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import RouteMap from '../../../farming/routeMap';
import { Point } from '../../../farming/routeMap/utils';
import VideoPlayer from '../../../farming/videoPlayer';
import route from '../../route.json';
import { savePointsServer } from '../actions';

const maps = route[0].maps;

export default function RouteSyncTest() {
	const { enqueueSnackbar } = useSnackbar();

	const videoRef = useRef<HTMLVideoElement>(null);

	const [currentRoute, setCurrentRoute] = useState(maps[0]);
	const [points, setPoints] = useFetchState<Point[]>(`/points/${currentRoute}.json`, []);
	const [time, setTime] = useState(0);

	const currentIndex = maps.indexOf(currentRoute);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => {
		setTime(videoRef.current.currentTime);
	});

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
					border: '1px solid blue',
				}}>
				<Box
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'start',
						alignSelf: 'start',
						width: '50%',
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
					</Stack>
				</Box>
				<RouteMap
					src={currentRoute}
					points={points}
					time={time}
					setTime={(time) => {
						setTime(time);
						if (!videoRef.current) return;
						videoRef.current.currentTime = time;
					}}
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
