'use client';
import { type MapData, type RouteData } from '@/api/routes/types';
import ImageRoute from '@/components/imageRoute';
import { type Point } from '@/components/imageRoute/types';
import useRouteVideoSync from '@/components/imageRoute/useRouteVideoSync';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import VideoPlayer from '@/components/videoPlayer';
import useEventListener from '@/hooks/useEventListener';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { prop, sumBy } from 'remeda';
import { useMeasure } from 'rooks';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

const MapModal = dynamicModal(() => import('./mapModal'));

const recording = false;

export default function FarmingRoute({ routeData }: { routeData: RouteData }) {
	const { showModal } = useModal();
	const router = useRouter();

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

	// autoplay
	useEventListener(videoRef.current, 'ended', () => {
		if (!recording) return;
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
			<Image
				fill
				alt='background'
				src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/${String(routeData.mapsData[selectedMap].background ?? 'teyvat').replace(/\.png$/i, '')}.png`}
				style={{ zIndex: -1, objectFit: 'cover', opacity: 0.5 }}
			/>
			<Box
				sx={{
					position: mobile ? 'relative' : 'absolute',
					width: mobile ? '100%' : '50%',
				}}>
				{!recording && (
					<Button
						variant='contained'
						color='primary'
						startIcon={<ArrowBackIcon />}
						sx={{ position: 'absolute', ml: 2, mt: 2 }}
						onClick={() => router.push(`/farming?route=${routeData.id}`)}>
						Back
					</Button>
				)}
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
				src={mapData ? `${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.video}` : null}
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
				<ImageRoute
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
					deps={mapData?.id}
					sx={{ aspectRatio: 1 }}>
					{mapData && (
						<Image
							fill
							alt={mapData?.name ?? 'Map'}
							src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.image}`}
							style={{ zIndex: -1, objectFit: 'contain', opacity: points ? 1 : 0 }}
							onLoad={() => setIsLoaded(true)}
						/>
					)}
				</ImageRoute>
				{!recording && (
					<Button
						variant='contained'
						color='primary'
						sx={{ position: 'absolute', top: 0, mt: 2, ml: 2 }}
						onClick={() => showModal(MapModal, { props: { routeData, selectedMap } })}>
						Full Map
					</Button>
				)}
			</Box>
		</Box>
	);
}
