'use client';
import ImageRouteEditor from '@/components/imageRoute/imageRouteEditor';
import type { Point } from '@/components/imageRoute/types';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import { Container, Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { MapRenderPath, MapRenderPoint } from '../../../../farming/render';
import RouteSelect from '../../../../farming/routeSelect';
import { savePointsServer } from '../actions';

export default function InternalRouteMap() {
	const { enqueueSnackbar } = useSnackbar();

	const [selectedRoute, setSelectedRoute] = useState(0);
	const routeName = `route_${selectedRoute}`;

	const [points] = useFetchState<Point[]>(
		`${process.env.NEXT_PUBLIC_STORAGE_URL}/points/${routeName}.json`,
		[],
	);
	if (!points) return null;

	return (
		<Container>
			<Grid container spacing={1}>
				<Grid>
					<RouteSelect
						value={selectedRoute}
						onChange={({ target }) => {
							setSelectedRoute(target.value);
						}}
					/>
				</Grid>
				<Grid size={12}>
					<RatioContainer width={16} height={9} sx={{ height: 'calc(100vh - 50px)' }}>
						<ImageRouteEditor
							alt='Teyvat'
							imageSrc={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/teyvat.png`}
							points={points}
							sx={{ aspectRatio: '16 / 9' }}
							getInitialPosition={(containerSize) =>
								calculateOptimalZoom(points, containerSize, 0.9)
							}
							RenderPoint={MapRenderPoint}
							RenderPath={MapRenderPath}
							savePoints={async (points) => {
								await savePointsServer(points, routeName);
								enqueueSnackbar('Saved', { variant: 'info' });
							}}
						/>
					</RatioContainer>
				</Grid>
			</Grid>
		</Container>
	);
}
