'use client';
import { routesInfo } from '@/api/routes';
import ImageRoute from '@/components/imageRoute';
import { type Point, type RenderExtraProps } from '@/components/imageRoute/types';
import useRouteVideoSync from '@/components/imageRoute/useRouteVideoSync';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import VideoPlayer from '@/components/videoPlayer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Fragment, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMeasure } from 'rooks';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

const MapModal = dynamicModal(() => import('./mapModal'));

export default function FarmingRoute({ params }: { params: Promise<{ route: string }> }) {
	const { showModal } = useModal();
	const router = useRouter();
	const { route } = use(params);
	const selectedRoute = routesInfo[+route];

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	let [points] = useFetchState<Point[]>(
		`${process.env.NEXT_PUBLIC_STORAGE_URL}/points/${mapName}.json`,
		[],
	);

	const [ref, measurements] = useMeasure();
	const imageRef = useRef<HTMLImageElement>(null);

	const [isLoaded, setIsLoaded] = useState(false);
	if (!isLoaded) points = null;

	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points, true);

	useEffect(() => {
		if (!imageRef.current) return;
		setIsLoaded(imageRef.current.complete);
	}, [imageRef]);

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
	const mobile = ratio < 0.75;

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
			<Box sx={{ position: mobile ? 'relative' : 'absolute', width: mobile ? '100%' : '50%' }}>
				<Button
					variant='contained'
					color='primary'
					startIcon={<ArrowBackIcon />}
					sx={{ position: 'absolute', left: 10, top: 10 }}
					onClick={() => router.push(`/farming?route=${route}`)}>
					Back
				</Button>
				<Stack spacing={mobile ? 1 : 3} sx={{ py: mobile ? 2 : 5, alignItems: 'center' }}>
					<Paper sx={{ py: 1, borderRadius: 100, minWidth: 200, textAlign: 'center' }}>
						<Typography variant={mobile ? 'h3' : 'h1'}>
							Total: {selectedRoute.maps[selectedMap].start + spots}
						</Typography>
					</Paper>
					<Typography variant={mobile ? 'h5' : 'h2'}>
						Spots: {spots} / {selectedRoute.maps[selectedMap].spots}
					</Typography>
					<PathSelect
						route={selectedRoute}
						selectedMap={selectedMap}
						setSelectedMap={setSelectedMap}
					/>
				</Stack>
			</Box>
			<VideoPlayer
				ref={videoRef}
				src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/videos/${mapName}.mp4`}
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
					RenderExtra={RenderExtra}
					sx={{ aspectRatio: 1 }}>
					<Image
						fill
						alt={mapName}
						ref={imageRef}
						src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/${mapName}.png`}
						style={{ zIndex: -1, objectFit: 'contain' }}
						onLoad={() => setIsLoaded(true)}
					/>
				</ImageRoute>
				<Button
					variant='contained'
					color='primary'
					sx={{ position: 'absolute', left: 10, top: 10 }}
					onClick={() => showModal(MapModal, { props: { route, map: selectedMap } })}>
					Full Map
				</Button>
			</Box>
		</Box>
	);
}
