'use client';
import { routesInfo } from '@/api/routes';
import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import PageTitle from '@/components/page/pageTitle';
import fetcher from '@/helpers/fetcher';
import useParamState from '@/hooks/useParamState';
import { Button, Container, MenuItem, Select } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { MapRenderPath, MapRenderPoint } from './render';

export default function Farming() {
	const router = useRouter();

	const [selectedRoute, setSelectedRoute] = useParamState('route', 0);

	const { data } = useSWR<Point[]>(`/points/route_${selectedRoute}.json`, fetcher);

	return (
		<Container>
			<PageTitle>Artifact Farming</PageTitle>
			<Select
				value={selectedRoute}
				onChange={({ target }) => {
					setSelectedRoute(target.value);
				}}>
				{routesInfo.map(({ spots, mora }, index) => (
					<MenuItem key={index} value={index}>
						Spots: {spots}, Mora: {mora}
					</MenuItem>
				))}
			</Select>
			<Button
				variant='contained'
				component={Link}
				href={`/farming/${selectedRoute}`}
				sx={{ ml: 1 }}>
				Go
			</Button>
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
				sx={{ aspectRatio: '16 / 9' }}
			/>
		</Container>
	);
}
