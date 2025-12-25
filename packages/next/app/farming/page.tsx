'use client';
import { routesInfo } from '@/api/routes';
import PageTitle from '@/components/page/title';
import useEventListener from '@/src/hooks/useEventListener';
import useParamState from '@/src/hooks/useParamState';
import { Box, Container, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import MapSelect from './mapSelect';
import RouteMap from './routeMap';
import { type Point } from './routeMap/utils';
import VideoPlayer from './videoPlayer';

export default function Farming() {
	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedRoute, setSelectedRoute] = useState(0);
	const route = routesInfo[selectedRoute];
	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = route.maps[selectedMap].src;
	const [time, setTime] = useState(0);

	const { data } = useSWR<Point[]>(`/points/${mapName}.json`, async (url: string) => {
		const { data } = await axios.get(url);
		return data;
	});

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

	// calculate spots collected at current time
	const spots = useMemo(
		() =>
			route.maps[selectedMap].start +
			(data?.filter((point) => (!point.artifact ? false : time >= point.artifact)).length ?? 0),
		[route, selectedMap, data, time],
	);

	return (
		<Container>
			<PageTitle>Artifact Farming</PageTitle>
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
						<Stack spacing={1} sx={{ alignItems: 'center', py: 2 }}>
							<Paper sx={{ py: 1, borderRadius: 100, width: 200, textAlign: 'center' }}>
								<Typography variant='h1'>Total: {spots}</Typography>
							</Paper>
							<Typography variant='h2'>Spots: {route.maps[selectedMap].spots}</Typography>
							<MapSelect
								route={route}
								selectedMap={selectedMap}
								setSelectedMap={setSelectedMap}
							/>
						</Stack>
					</Box>
					<RouteMap
						src={mapName}
						points={data ?? []}
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
						src={mapName}
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
		</Container>
	);
}
