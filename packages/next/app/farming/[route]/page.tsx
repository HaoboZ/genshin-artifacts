'use client';
import { routesInfo } from '@/api/routes';
import ImageRouteSync from '@/components/imageRoute/imageRouteSync';
import { type Point } from '@/components/imageRoute/types';
import PageTitle from '@/components/page/pageTitle';
import VideoPlayer from '@/components/videoPlayer';
import fetcher from '@/helpers/fetcher';
import useEventListener from '@/hooks/useEventListener';
import useParamState from '@/hooks/useParamState';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { use, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import PathSelect from './pathSelect';
import { RouteMarker, RouteRenderPath, RouteRenderPoint } from './render';

export default function FarmingRoute({ params }: { params: Promise<{ route: string }> }) {
	const { route } = use(params);

	const videoRef = useRef<HTMLVideoElement>(null);

	const selectedRoute = routesInfo[route];
	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;
	const [time, setTime] = useState(0);

	const { data } = useSWR<Point[]>(`/points/${mapName}.json`, fetcher);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

	// calculate spots collected at current time
	const spots = useMemo(
		() =>
			selectedRoute.maps[selectedMap].start +
			(data?.filter((point) => (!point.marked ? false : time >= point.marked)).length ?? 0),
		[selectedRoute, selectedMap, data, time],
	);

	return (
		<Container>
			<PageTitle>Artifact Farming</PageTitle>
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
						}}>
						<Stack spacing={1} sx={{ alignItems: 'center', py: 2 }}>
							<Paper sx={{ py: 1, borderRadius: 100, width: 200, textAlign: 'center' }}>
								<Typography variant='h1'>Total: {spots}</Typography>
							</Paper>
							<Typography variant='h2'>
								Spots: {selectedRoute.maps[selectedMap].spots}
							</Typography>
							<PathSelect
								route={selectedRoute}
								selectedMap={selectedMap}
								setSelectedMap={setSelectedMap}
							/>
						</Stack>
					</Box>
					<ImageRouteSync
						src={mapName}
						points={data}
						hidePoints
						time={time}
						setTime={(time) => {
							setTime(time);
							if (!videoRef.current) return;
							videoRef.current.currentTime = time;
						}}
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
					</ImageRouteSync>
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
