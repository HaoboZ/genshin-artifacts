'use client';
import { type Point } from '@/components/imageRoute/types';
import useFetchState from '@/hooks/useFetchState';
import { Container } from '@mui/material';
import { useState } from 'react';
import { MapRenderPath, MapRenderPoint } from '../../../../farming/render';
import RouteSelect from '../../../../farming/routeSelect';
import ImageRouteEditor from '../imageRouteEditor';

export default function InternalRouteMap() {
	const [selectedRoute, setSelectedRoute] = useState(0);
	const routeName = `route_${selectedRoute}`;

	const [points, setPoints] = useFetchState<Point[]>(`/points/${routeName}.json`, []);

	return (
		<Container>
			<RouteSelect
				value={selectedRoute}
				onChange={({ target }) => {
					setSelectedRoute(target.value);
				}}
			/>
			<ImageRouteEditor
				src='teyvat'
				route={routeName}
				points={points}
				setPoints={setPoints}
				sx={{ aspectRatio: '16 / 9' }}
				RenderPoint={MapRenderPoint}
				RenderPath={MapRenderPath}
			/>
		</Container>
	);
}
