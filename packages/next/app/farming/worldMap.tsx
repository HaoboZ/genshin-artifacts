'use client';
import { type RouteData } from '@/api/routes/types';
import ImageRoute from '@/components/imageRoute';
import { type Point } from '@/components/imageRoute/types';
import { calculateCenterZoom, calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Box, Button, MenuItem, Select } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { filter, map, pick, pipe } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from './render';

const routes = ['n9HJqwqbsmkqR9ZpKK_tE', 'I4mrpd4FRvCdz-5VrUG7G'];

export default function WorldMap({ routesData, top }: { routesData: RouteData[]; top?: boolean }) {
	const router = useRouter();

	const [selectedRoute, setSelectedRoute] = useParamState('route', routes[0]);

	const [routeData] = useFetchState<RouteData>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${selectedRoute}.json`,
	);

	const points = useMemo(() => {
		if (!routeData) return null;

		return pipe(
			routeData?.mapsData,
			filter(({ x, y }) => x !== undefined && y !== undefined),
			map((data, index) => ({ ...pick(data, ['x', 'y', 'type']), marked: index + 1 })),
		) as Point[];
	}, [routeData]);

	return (
		<RatioContainer width={16} height={9} sx={top ? { alignItems: 'unset' } : undefined}>
			<Box
				sx={{
					display: 'flex',
					position: 'absolute',
					top: 16,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 'drawer',
				}}>
				<Select
					size='small'
					value={selectedRoute}
					onChange={(e) => {
						setSelectedRoute(e.target.value);
					}}
					sx={{
						maxWidth: 'calc(100vw - 70px)',
						bgcolor: 'background.paper',
						backdropFilter: 'blur(10px)',
					}}>
					{routes.map((id) => (
						<MenuItem key={id} value={id}>
							{routesData.find((route) => route.id === id).name}
						</MenuItem>
					))}
				</Select>
				<Button
					variant='contained'
					component={Link}
					href={`/farming/${selectedRoute}`}
					sx={{ ml: 1, minWidth: 'fit-content' }}>
					Go
				</Button>
			</Box>
			<ImageRoute
				points={points}
				activeSpot={points && { point: points[0] }}
				setActiveSpot={(activeSpot) => {
					if (!activeSpot || activeSpot.percentage) return;
					router.push(
						`/farming/${selectedRoute}?map=${points[activeSpot.pointIndex].marked - 1}`,
					);
				}}
				RenderPoint={MapRenderPoint}
				RenderPath={MapRenderPath}
				RenderExtra={MapRenderExtra}
				getInitialPosition={(containerSize) => calculateOptimalZoom(points, containerSize, 0.9)}
				getAnimatedPosition={(containerSize) =>
					calculateCenterZoom(points[0], containerSize, 3)
				}
				sx={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
				<Image
					fill
					alt='teyvat'
					src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
		</RatioContainer>
	);
}
