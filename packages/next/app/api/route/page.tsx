'use client';
import { type Point } from '@/components/imageRoute/types';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Container, MenuItem, Select, Stack } from '@mui/material';
import { useState } from 'react';
import PathSelect from '../../farming/[route]/pathSelect';
import { RouteMarker, RouteRenderPath, RouteRenderPoint } from '../../farming/[route]/render';
import { routesInfo } from '../routes';
import ImageRouteEditor from './imageRouteEditor';

export default function InternalRoute() {
	const [selectedRoute, setSelectedRoute] = useState(0);
	const route = routesInfo[selectedRoute];
	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = route.maps[selectedMap].src;
	const [points, setPoints] = useFetchState<Point[]>(`/points/${mapName}.json`, []);

	return (
		<Container>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center', py: 1 }}>
				<Select
					value={selectedRoute}
					onChange={({ target }) => {
						setSelectedRoute(target.value);
						setSelectedMap(0);
						setPoints([]);
					}}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Spots: {spots}, Mora: {mora}
						</MenuItem>
					))}
				</Select>
				<PathSelect
					route={route}
					selectedMap={selectedMap}
					setSelectedMap={(selectedMap) => {
						setSelectedMap(selectedMap);
						setPoints([]);
					}}
				/>
			</Stack>
			<ImageRouteEditor
				src={mapName}
				points={points}
				setPoints={setPoints}
				RenderPoint={RouteRenderPoint}
				RenderPath={RouteRenderPath}
				sx={{ aspectRatio: 1 }}>
				<RouteMarker />
			</ImageRouteEditor>
		</Container>
	);
}
