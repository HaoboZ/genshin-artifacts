'use client';
import { routesInfo } from '@/api/routes';
import ImageRoute from '@/components/imageRoute';
import { type Point, type RenderExtraProps } from '@/components/imageRoute/types';
import useRouteVideoSync from '@/components/imageRoute/useRouteVideoSync';
import VideoPlayer from '@/components/videoPlayer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Fragment, use, useCallback, useMemo } from 'react';
import { useMeasure } from 'rooks';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

export default function FarmingRoute({ params }: { params: Promise<{ route: string }> }) {
	const router = useRouter();
	const { route } = use(params);
	const selectedRoute = routesInfo[+route];

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	const [points] = useFetchState<Point[]>(`/points/${mapName}.json`, []);

	const [ref, measurements] = useMeasure();
	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points, true);

	// calculate spots collected at current time
	const spots = useMemo(
		() => points?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0,
		[points, time],
	);

	const RenderExtra = useCallback(
		({ containerSize }: RenderExtraProps) => {
			return (
				<Fragment>
					<RouteRenderExtra />
					{selectedRoute.maps[selectedMap].text?.map(({ x, y, text, size }, i) => (
						<text
							key={i}
							x={x * containerSize.width}
							y={y * containerSize.height}
							fill='white'
							fontSize={size * containerSize.width}
							fontStyle='bold'>
							{text}
						</text>
					))}
				</Fragment>
			);
		},
		[selectedRoute, selectedMap],
	);

	const ratio = measurements.innerWidth / measurements.innerHeight;
	const mobile = ratio < 0.6;

	return (
		<Box
			ref={ref}
			sx={{ maxWidth: '200vh', height: '100vh', position: 'relative', margin: '0 auto' }}>
			<Image
				fill
				alt='background'
				src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/backgrounds/${mapName.split('/')[0]}.png`}
				style={{ zIndex: -1, objectFit: 'cover', opacity: 0.5 }}
			/>
			<Box sx={{ position: 'absolute', width: mobile ? '100%' : '50%' }}>
				<Button
					variant='contained'
					color='primary'
					startIcon={<ArrowBackIcon />}
					sx={{ position: 'absolute', left: 10, top: 10 }}
					onClick={() => router.push(`/farming?route=${route}`)}>
					Back
				</Button>
				<Stack spacing={{ xs: 1, sm: 2 }} sx={{ py: 5, alignItems: 'center' }}>
					<Paper sx={{ py: 1, borderRadius: 100, width: 200, textAlign: 'center' }}>
						<Typography variant='h1'>
							Total: {selectedRoute.maps[selectedMap].start + spots}
						</Typography>
					</Paper>
					<Typography variant='h2'>
						Spots: {spots} / {selectedRoute.maps[selectedMap].spots}
					</Typography>
					<PathSelect
						route={selectedRoute}
						selectedMap={selectedMap}
						setSelectedMap={setSelectedMap}
					/>
				</Stack>
			</Box>
			<ImageRoute
				ref={routeRef}
				points={points}
				hidePoints
				activeSpot={activeSpot}
				setActiveSpot={setActiveSpot}
				sx={{
					position: 'absolute',
					width: mobile ? '100%' : '50%',
					aspectRatio: 1,
					right: 0,
					top: mobile ? 200 : 0,
				}}
				RenderPoint={RouteRenderPoint}
				RenderPath={RouteRenderPath}
				RenderExtra={RenderExtra}>
				<Image
					fill
					alt={mapName}
					src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/${mapName}.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
			<VideoPlayer
				ref={videoRef}
				src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/videos/${mapName}.mp4`}
				seekFrames={60}
				sx={{ position: 'absolute', bottom: 0, width: ratio > 0.94 ? '50%' : '100%' }}
			/>
		</Box>
	);
}
