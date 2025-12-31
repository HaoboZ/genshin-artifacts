'use client';
import { routesInfo } from '@/api/routes';
import ImageRouteSync from '@/components/imageRoute/imageRouteSync';
import { type Point, type RenderExtraProps } from '@/components/imageRoute/types';
import fetcher from '@/helpers/fetcher';
import useEventListener from '@/hooks/useEventListener';
import useParamState from '@/hooks/useParamState';
import { Box, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { Fragment, use, useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import PathSelect from './pathSelect';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from './render';

export default function FarmingRoute({ params }: { params: Promise<{ route: string }> }) {
	const { route } = use(params);
	const selectedRoute = routesInfo[+route];

	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;
	const [time, setTime] = useState(0);

	const { data } = useSWR<Point[]>(`/points/${mapName}.json`, fetcher);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => setTime(videoRef.current.currentTime));

	// calculate spots collected at current time
	const spots = useMemo(
		() => data?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0,
		[data, time],
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
					position: 'relative',
				}}>
				<Box
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'start',
						alignSelf: 'start',
						width: '50%',
					}}>
					<Image
						fill
						alt='background'
						src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/backgrounds/${mapName.split('/')[0]}.png`}
						style={{ zIndex: -1, opacity: 0.5 }}
					/>
					<Stack spacing={1} sx={{ alignItems: 'center', py: 2 }}>
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
					videoRef={videoRef}
					points={data}
					hidePoints
					time={time}
					setTime={setTime}
					autoplay
					seekFrames={60}
					RenderPoint={RouteRenderPoint}
					RenderPath={RouteRenderPath}
					RenderExtra={RenderExtra}
					sx={{
						gridColumn: 1,
						gridRow: 1,
						justifySelf: 'end',
						alignSelf: 'start',
						width: '50%',
						aspectRatio: 1,
					}}
				/>
			</Box>
		</Box>
	);
}
