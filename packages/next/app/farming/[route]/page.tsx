'use client';
import { routesInfo } from '@/api/routes';
import ImageRouteSync from '@/components/imageRoute/imageRouteSync';
import { type Point, type RenderExtraProps } from '@/components/imageRoute/types';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Box, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { Fragment, use, useCallback, useMemo, useRef, useState } from 'react';
import { useOnWindowResize } from 'rooks';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

export default function FarmingRoute({ params }: { params: Promise<{ route: string }> }) {
	const { route } = use(params);
	const selectedRoute = routesInfo[+route];

	const containerRef = useRef<HTMLDivElement>(null);

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	const [points] = useFetchState<Point[]>(`/points/${mapName}.json`, []);

	const [time, setTime] = useState(0);
	const [scale, setScale] = useState(1);

	// Calculate scale based on container size
	useOnWindowResize(() => {
		setScale(containerRef.current.offsetWidth / 1000);
	});

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

	return (
		<Box sx={{ maxWidth: '200vh', height: '100vh', position: 'relative', margin: '0 auto' }}>
			<Image
				fill
				alt='background'
				src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/backgrounds/${mapName.split('/')[0]}.png`}
				style={{ zIndex: -1, objectFit: 'cover', opacity: 0.5 }}
			/>
			<Box
				sx={{
					position: 'absolute',
					width: '50%',
					transform: `scale(${scale})`,
					transformOrigin: 'top center',
				}}>
				<Stack spacing={2} sx={{ py: 5, alignItems: 'center' }}>
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
			<ImageRouteSync
				src={mapName}
				points={points}
				hidePoints
				time={time}
				setTime={setTime}
				autoplay
				seekFrames={60}
				RenderPoint={RouteRenderPoint}
				RenderPath={RouteRenderPath}
				RenderExtra={RenderExtra}
			/>
		</Box>
	);
}
