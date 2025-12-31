'use client';
import { type Point } from '@/components/imageRoute/types';
import useFetchState from '@/hooks/useFetchState';
import { Container, MenuItem, Select, Stack } from '@mui/material';
import { useState } from 'react';
import { MapRenderPath, MapRenderPoint } from '../../../../farming/render';
import { routesInfo } from '../../../routes';
import ImageRouteEditor from '../imageRouteEditor';

export default function InternalRouteMap() {
	const [selectedRoute, setSelectedRoute] = useState(0);
	const routeName = `route_${selectedRoute}`;
	const [points, setPoints] = useFetchState<Point[]>(`/points/${routeName}.json`, []);

	return (
		<Container>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center', py: 1 }}>
				<Select
					value={selectedRoute}
					onChange={({ target }) => {
						setSelectedRoute(target.value);
						setPoints([]);
					}}>
					{routesInfo.map(({ spots, mora }, index) => (
						<MenuItem key={index} value={index}>
							Spots: {spots}, Mora: {mora}
						</MenuItem>
					))}
				</Select>
			</Stack>
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
