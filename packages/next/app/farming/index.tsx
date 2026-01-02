'use client';
import { routesInfo } from '@/api/routes';
import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import RatioContainer from '@/components/ratioContainer';
import fetcher from '@/helpers/fetcher';
import useParamState from '@/hooks/useParamState';
import { Button, MenuItem, Select, Stack } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { MapRenderPath, MapRenderPoint } from './render';

export default function FarmingMap() {
	const router = useRouter();

	const [selectedRoute, setSelectedRoute] = useParamState('route', 0);

	const { data } = useSWR<Point[]>(`/points/route_${selectedRoute}.json`, fetcher);

	return (
		<RatioContainer width={16} height={9} sx={{ position: 'relative' }}>
			<Stack
				direction='row'
				sx={{
					position: 'absolute',
					top: 16,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 'drawer',
					width: 400,
				}}>
				<Select
					fullWidth
					size='small'
					value={selectedRoute}
					onChange={({ target }) => {
						setSelectedRoute(target.value);
					}}
					sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(10px)' }}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Artifact Spots: {spots}, Mora: {mora}
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
			</Stack>
			<ImageRoute
				src='teyvat'
				route={selectedRoute.toString()}
				points={data}
				setActiveSpot={(activeSpot) => {
					if (!activeSpot) return;
					router.push(
						`/farming/${selectedRoute}?map=${data[activeSpot.pointIndex].marked - 1}`,
					);
				}}
				RenderPoint={MapRenderPoint}
				RenderPath={MapRenderPath}
				zoom={0.9}
				disableAnimations
				sx={{ width: '100%', height: '100%' }}
			/>
		</RatioContainer>
	);
}
