'use client';
import ImageRouteEditor from '@/components/imageRoute/imageRouteEditor';
import type { Point } from '@/components/imageRoute/types';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import useParamState from '@/hooks/useParamState';
import { Container, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { use } from 'react';
import PathSelect from '../../../farming/[route]/pathSelect';
import { RouteRenderExtra, RouteRenderPath } from '../../../farming/[route]/render';
import RouteSelect from '../../../farming/routeSelect';
import { routesInfo } from '../../routes';
import { savePointsServer } from './actions';
import { EditRouteRenderPoint } from './renderPoint';

export default function InternalRoute({ params }: { params: Promise<{ route: string }> }) {
	const { enqueueSnackbar } = useSnackbar();
	const router = useRouter();
	const { route } = use(params);
	const selectedRoute = routesInfo[route];

	const [selectedMap, setSelectedMap] = useParamState('map', 0);
	const mapName = selectedRoute.maps[selectedMap].src;

	const [points] = useFetchState<Point[]>(
		`${process.env.NEXT_PUBLIC_STORAGE_URL}/points/${mapName}.json`,
		[],
	);
	if (!points) return null;

	return (
		<Container>
			<Grid container spacing={1}>
				<Grid>
					<RouteSelect
						value={+route}
						onChange={({ target }) => {
							router.push(`/api/route/${target.value}`);
						}}
					/>
				</Grid>
				<Grid>
					<PathSelect
						route={selectedRoute}
						selectedMap={selectedMap}
						setSelectedMap={setSelectedMap}
					/>
				</Grid>
				<Grid size={12}>
					<RatioContainer width={1} height={1} sx={{ height: 'calc(100vh - 50px)' }}>
						<ImageRouteEditor
							alt={mapName}
							imageSrc={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/${mapName}.png`}
							points={points}
							sx={{ aspectRatio: 1 }}
							getInitialPosition={(containerSize) =>
								calculateOptimalZoom(points, containerSize, 0.75)
							}
							RenderPoint={EditRouteRenderPoint}
							RenderPath={RouteRenderPath}
							RenderExtra={RouteRenderExtra}
							savePoints={async (points) => {
								await savePointsServer(points, mapName);
								enqueueSnackbar('Saved', { variant: 'info' });
							}}
						/>
					</RatioContainer>
				</Grid>
			</Grid>
		</Container>
	);
}
