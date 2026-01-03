'use client';
import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Box, Button, type SxProps } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapRenderPath, MapRenderPoint } from './render';
import RouteSelect from './routeSelect';

export default function FarmingMap({ sx }: { sx?: SxProps }) {
	const router = useRouter();

	const [selectedRoute, setSelectedRoute] = useParamState('route', 0);

	const [points] = useFetchState<Point[]>(`/points/route_${selectedRoute}.json`, []);

	return (
		<RatioContainer width={16} height={9} sx={sx}>
			<Box
				sx={{
					display: 'flex',
					position: 'absolute',
					top: 16,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 'drawer',
				}}>
				<RouteSelect
					value={selectedRoute}
					onChange={({ target }) => {
						setSelectedRoute(target.value);
					}}
					sx={{
						maxWidth: 'calc(100vw - 70px)',
						bgcolor: 'background.paper',
						backdropFilter: 'blur(10px)',
					}}
				/>
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
				setActiveSpot={(activeSpot) => {
					if (!activeSpot) return;
					router.push(
						`/farming/${selectedRoute}?map=${points[activeSpot.pointIndex].marked - 1}`,
					);
				}}
				RenderPoint={MapRenderPoint}
				RenderPath={MapRenderPath}
				initialZoom={0.9}
				disableAnimations
				sx={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
				<Image
					fill
					alt='teyvat'
					src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/teyvat.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
		</RatioContainer>
	);
}
