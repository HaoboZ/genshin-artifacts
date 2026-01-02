'use client';
import { type Point } from '@/components/imageRoute/types';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Container, MenuItem, Select, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import PathSelect from '../../../farming/[route]/pathSelect';
import {
	RouteRenderExtra,
	RouteRenderPath,
	RouteRenderPoint,
} from '../../../farming/[route]/render';
import { routesInfo } from '../../routes';
import ImageRouteEditor from './imageRouteEditor';

export default function InternalRoute({ params }: { params: Promise<{ route: string }> }) {
	const router = useRouter();
	const { route } = use(params);
	const selectedRoute = routesInfo[route];

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	const [points, setPoints] = useFetchState<Point[]>(`/points/${mapName}.json`, []);

	return (
		<Container>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center', py: 1 }}>
				<Select
					value={route}
					onChange={({ target }) => {
						router.push(`/api/route/${target.value}`);
					}}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Spots: {spots}, Mora: {mora}
						</MenuItem>
					))}
				</Select>
				<PathSelect
					route={selectedRoute}
					selectedMap={selectedMap}
					setSelectedMap={setSelectedMap}
				/>
			</Stack>
			<ImageRouteEditor
				src={mapName}
				points={points}
				setPoints={setPoints}
				RenderPoint={RouteRenderPoint}
				RenderPath={RouteRenderPath}
				RenderExtra={RouteRenderExtra}
				sx={{ aspectRatio: 1 }}
			/>
		</Container>
	);
}
