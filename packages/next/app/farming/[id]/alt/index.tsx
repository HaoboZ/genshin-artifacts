'use client';
import { type MapData, type RouteData } from '@/api/routes/types';
import ImageRoute from '@/components/imageRoute';
import { type Point } from '@/components/imageRoute/types';
import useRouteVideoSync from '@/components/imageRoute/useRouteVideoSync';
import { calculateCenterZoom, findSpotByTime } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import VideoPlayer from '@/components/videoPlayer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { prop, sumBy } from 'remeda';
import PathSelect from '../pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from '../render';

const MapModal = dynamicModal(() => import('../mapModal'));

export default function FarmingRouteAlt({ routeData }: { routeData: RouteData }) {
	const { showModal } = useModal();
	const router = useRouter();

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const [mapData] = useFetchState<MapData>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${routeData.maps[selectedMap]}.json`,
	);

	const [isLoaded, setIsLoaded] = useState(false);
	const [points, setPoints] = useState<Point[]>(null);

	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	useEffect(() => {
		setIsLoaded(false);
		setPoints(null);
	}, [selectedMap]);

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
		videoRef.current.style.opacity = routeRef.current.style.opacity = points ? '1' : '0';
		if (!points) return;
		const timeout = setTimeout(() => videoRef.current.play(), 2000);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	return (
		<RatioContainer width={16} height={9} sx={{ height: '100vh' }}>
			<VideoPlayer
				ref={videoRef}
				src={mapData ? `${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.video}` : null}
				sx={{ position: 'absolute', width: '100%' }}
			/>
			<Box sx={{ position: 'absolute', mx: 'auto', width: '25%', left: 0 }}>
				<ImageRoute
					ref={routeRef}
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					followActiveSpot
					getAnimatedPosition={(containerSize) => {
						const { point } = findSpotByTime(points, time);
						return calculateCenterZoom(point, containerSize, 3);
					}}
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
				<Button
					variant='contained'
					color='primary'
					sx={{
						position: 'absolute',
						top: 0,
						mt: '5%',
						ml: '5%',
						scale: 'min(1, calc(100vh / 720px), calc(100vw / 1280px))',
						transformOrigin: 'top left',
						width: 'max-content',
					}}
					onClick={() => showModal(MapModal, { props: { routeData, selectedMap } })}>
					Full Map
				</Button>
			</Box>
			{mapData && (
				<Grid
					container
					spacing={2}
					sx={{
						position: 'absolute',
						left: '25%',
						scale: 'min(1, calc(100vh / 720px), calc(100vw / 1280px))',
						transformOrigin: 'top left',
						width: 'calc(40% / min(1, calc(100vh / 720px), calc(100vw / 1280px)))',
						alignItems: 'center',
						justifyContent: 'center',
						mt: '1%',
						ml: '1%',
					}}>
					<Grid>
						<Button
							variant='contained'
							color='primary'
							startIcon={<ArrowBackIcon />}
							onClick={() => router.push(`/farming?route=${routeData.id}`)}>
							Back
						</Button>
					</Grid>
					<Grid
						size='grow'
						component={Paper}
						sx={{ py: 1, borderRadius: 100, minWidth: 200, textAlign: 'center' }}>
						<Typography variant='h1'>
							Total: {totalSpots + spots} /{' '}
							{totalSpots + routeData.mapsData[selectedMap].spots}
						</Typography>
					</Grid>
					<Grid>
						<PathSelect
							route={routeData}
							selectedMap={selectedMap}
							setSelectedMap={setSelectedMap}
						/>
					</Grid>
				</Grid>
			)}
		</RatioContainer>
	);
}
