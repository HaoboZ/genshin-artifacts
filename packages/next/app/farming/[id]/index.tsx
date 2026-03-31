'use client';

import { type MapData, type RouteData } from '@/api/routes/types';
import VideoPlayer from '@/components/videoPlayer';
import useEventListener from '@/hooks/useEventListener';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import {
	calculateOptimalZoom,
	ImageMapRoute,
	type Point,
	useRouteVideoSync,
} from 'image-map-route';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { prop, sumBy } from 'remeda';
import { useMeasure } from 'rooks';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

const MapModal = dynamicModal(() => import('./mapModal'));

export default function FarmingRoute({ routeData }: { routeData: RouteData }) {
	const { showModal } = useModal();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const [mapData] = useFetchState<MapData>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${routeData.maps[selectedMap]}`,
	);

	const [isLoaded, setIsLoaded] = useState(false);
	const [points, setPoints] = useState<Point[]>(null);

	const [ref, measurements] = useMeasure();
	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	useEffect(() => {
		setPoints(null);
		setIsLoaded(false);
		videoRef.current.style.opacity = '0';
	}, [selectedMap, videoRef]);

	useEffect(() => {
		if (!mapData || !isLoaded) return;
		setPoints(mapData.points);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded]);

	const [spots, totalSpots] = useMemo(() => {
		return [
			points?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0,
			sumBy(
				routeData.mapsData.filter((_, index) => index < selectedMap),
				prop('spots'),
			),
		];
	}, [routeData, selectedMap, points, time]);

	useEffect(() => {
		routeRef.current.style.opacity = points ? '1' : '0';
		if (!points) return;
		const timeout = setTimeout(() => {
			videoRef.current.style.opacity = '1';
			videoRef.current.play();
		}, 2000);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	// Autoplay
	useEventListener(videoRef.current, 'ended', () => {
		if (!searchParams.has('recording')) return;
		setTimeout(() => {
			setSelectedMap(selectedMap + 1);
		}, 1000);
	});

	const ratio = measurements.innerWidth / measurements.innerHeight;
	const mobile = ratio < 0.75;

	return (
		<Box
			ref={ref}
			sx={{ maxWidth: '200vh', height: '100vh', position: 'relative', margin: '0 auto' }}>
			{routeData.mapsData[selectedMap].background && (
				<Image
					fill
					alt='background'
					src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/${routeData.mapsData[selectedMap].background}.png`}
					style={{ objectFit: 'cover', opacity: 0.5 }}
				/>
			)}
			<Box
				sx={{
					position: mobile ? 'relative' : 'absolute',
					width: mobile ? '100%' : '50%',
				}}>
				<Button
					variant='contained'
					color='primary'
					startIcon={<ArrowBackIcon />}
					sx={{
						display: searchParams.has('recording') ? 'none' : undefined,
						position: 'absolute',
						ml: 2,
						mt: 2,
					}}
					onClick={() => router.push(`/farming?route=${routeData.id}`)}>
					Back
				</Button>
				<Stack
					spacing={mobile ? 1 : 3}
					sx={{
						py: mobile ? 2 : 0,
						height: mobile ? undefined : '45vh',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<Paper sx={{ py: 1, borderRadius: 100, minWidth: 200, textAlign: 'center' }}>
						<Typography variant={mobile ? 'h3' : 'h1'}>
							Total: {totalSpots + spots}
						</Typography>
					</Paper>
					<Typography variant={mobile ? 'h5' : 'h2'}>
						Spots: {spots} / {routeData.mapsData[selectedMap].spots}
					</Typography>
					<PathSelect
						route={routeData}
						selectedMap={selectedMap}
						setSelectedMap={setSelectedMap}
					/>
				</Stack>
			</Box>
			<VideoPlayer
				ref={videoRef}
				src={
					mapData?.video
						? `${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.video}`
						: null
				}
				sx={{
					position: mobile ? 'relative' : 'absolute',
					bottom: 0,
					width: ratio < 0.94 ? '100%' : '50%',
				}}
			/>
			<Box
				sx={{
					position: mobile ? 'relative' : 'absolute',
					mx: 'auto',
					width: mobile ? '75%' : '50%',
					right: 0,
				}}>
				<ImageMapRoute
					ref={routeRef}
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					getAnimatedPosition={(containerSize) =>
						calculateOptimalZoom(points, containerSize, 0.75)
					}
					RenderPoint={RouteRenderPoint}
					RenderPath={RouteRenderPath}
					RenderExtra={RouteRenderExtra(mapData?.text)}
					style={{ aspectRatio: 1 }}
					deps={mapData?.id}>
					{mapData && (
						<Image
							fill
							alt={mapData?.name ?? 'Map'}
							src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.image}`}
							style={{ objectFit: 'contain', opacity: points ? 1 : 0 }}
							onLoad={() => setIsLoaded(true)}
						/>
					)}
				</ImageMapRoute>
				<Button
					variant='contained'
					color='primary'
					sx={{
						display: searchParams.has('recording') ? 'none' : undefined,
						position: 'absolute',
						top: 0,
						mt: 2,
						ml: 2,
					}}
					onClick={() => showModal(MapModal, { props: { routeData, selectedMap } })}>
					Full Map
				</Button>
			</Box>
		</Box>
	);
}
