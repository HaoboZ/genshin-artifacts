'use client';

import ImageRouteVideoEditor from '@/components/imageRoute/imageRouteVideoEditor';
import type { Point } from '@/components/imageRoute/types';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import { Button, Container, Grid, Typography } from '@mui/material';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { RouteRenderExtra, RouteRenderPath } from '../../../../../farming/[id]/render';
import { type MapData } from '../../../types';
import { EditRouteRenderPoint } from '../../renderPoint';
import MapControls from '../controls';

export default function MapVideo({ mapData }: { mapData: MapData }) {
	const [points, setPoints] = useState<Point[]>(mapData.points);

	const RenderText = useCallback(({ points, time }) => {
		const spots = points?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0;
		return <Typography>Spots: {spots}</Typography>;
	}, []);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
				<MapControls mapData={mapData} points={points} />
				{mapData.image && (
					<Grid>
						<Button
							component={Link}
							href={`/api/routes/maps/${mapData.id}`}
							variant='contained'>
							Point Edit
						</Button>
					</Grid>
				)}
				<Grid size={12}>
					{mapData.video ? (
						<RatioContainer width={2} height={1} sx={{ height: 'calc(100vh - 56px)' }}>
							<ImageRouteVideoEditor
								alt={mapData.name}
								imageSrc={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.image}`}
								videoSrc={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.video}`}
								points={points}
								setPoints={setPoints}
								getInitialPosition={(containerSize) =>
									calculateOptimalZoom(points, containerSize, 0.75)
								}
								sx={{ aspectRatio: 1 }}
								RenderPoint={EditRouteRenderPoint}
								RenderPath={RouteRenderPath}
								RenderExtra={RouteRenderExtra}
								RenderText={RenderText}
							/>
						</RatioContainer>
					) : (
						<Typography>No Video Found</Typography>
					)}
				</Grid>
			</Grid>
		</Container>
	);
}
