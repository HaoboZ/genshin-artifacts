'use client';
import ImageRouteSync from '@/components/imageRoute/imageRouteSync';
import { type Point, type Spot } from '@/components/imageRoute/types';
import useEventListener from '@/hooks/useEventListener';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Box, Button, Container, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { use, useMemo, useRef, useState } from 'react';
import { pick } from 'remeda';
import PathSelect from '../../../../farming/[route]/pathSelect';
import {
	RouteRenderExtra,
	RouteRenderPath,
	RouteRenderPoint,
} from '../../../../farming/[route]/render';
import { routesInfo } from '../../../routes';
import { savePointsServer } from '../actions';
import TimePointControls from './timePointControls';

export default function InternalRouteSync({ params }: { params: Promise<{ route: string }> }) {
	const router = useRouter();
	const { route } = use(params);
	const selectedRoute = routesInfo[route];

	const { enqueueSnackbar } = useSnackbar();

	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	const [points, setPoints] = useFetchState<Point[]>(`/points/${mapName}.json`, []);
	const [time, setTime] = useState(0);
	const [activeSpot, setActiveSpot] = useState<Spot>(null);
	const [extraSpot, setExtraSpot] = useState<Spot>(null);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

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

	const currentPointIndex = extraSpot?.pointIndex ?? 0;
	const nextPointIndex = currentPointIndex !== null ? currentPointIndex + 1 : null;

	// calculate spots collected at current time
	const spots = useMemo(
		() => points?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0,
		[points, time],
	);

	return (
		<Container>
			<Stack direction='row' spacing={1}>
				<Select
					value={route}
					onChange={({ target }) => {
						router.push(`/api/route/${target.value}/sync`);
					}}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Spots: {spots}, Mora: {mora}
						</MenuItem>
					))}
				</Select>
				<PathSelect
					route={selectedRoute}
					selectedMap={selectedMap}
					setSelectedMap={(selectedMap) => {
						setSelectedMap(selectedMap);
						setPoints([]);
						setExtraSpot(null);
					}}
				/>
			</Stack>
			<Box sx={{ maxWidth: '200vh', height: '90vh', position: 'relative', margin: '0 auto' }}>
				<Box
					sx={{
						position: 'absolute',
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
							Current Time: {time.toFixed(2)}s; Spots: {spots} /{' '}
							{selectedRoute.maps[selectedMap].spots}
						</Typography>
						<Stack direction='row' spacing={1}>
							<Button
								variant='contained'
								size='small'
								disabled={currentPointIndex <= 0}
								onClick={() => {
									setExtraSpot({
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
								disabled={nextPointIndex >= points?.length}
								onClick={() => {
									setExtraSpot({
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
											pick(extraSpot.point, ['x', 'y']),
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
										? points?.[currentPointIndex]
										: null
								}
								pointIndex={currentPointIndex}
								updatePointField={updatePointField}
							/>
							<TimePointControls
								name='Next'
								time={time}
								point={
									nextPointIndex !== null && nextPointIndex < points?.length
										? points?.[nextPointIndex]
										: null
								}
								pointIndex={nextPointIndex}
								updatePointField={updatePointField}
							/>
						</Grid>
					</Stack>
				</Box>
				<ImageRouteSync
					src={mapName}
					videoRef={videoRef}
					points={points}
					time={time}
					setTime={setTime}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					RenderPoint={RouteRenderPoint}
					RenderPath={RouteRenderPath}
					RenderExtra={RouteRenderExtra}
				/>
			</Box>
		</Container>
	);
}
