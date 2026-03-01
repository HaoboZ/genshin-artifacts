'use client';

import ImageRouteEditor from '@/components/imageRoute/imageRouteEditor';
import type { Point } from '@/components/imageRoute/types';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import { Button, Container, Grid, Typography } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { RouteRenderExtra, RouteRenderPath } from '../../../farming/[id]/render';
import { type MapData } from '../../routes/types';
import { EditRouteRenderPoint } from '../renderPoint';
import MapControls from './controls';

export default function Map({ mapData }: { mapData: MapData }) {
	const [points, setPoints] = useState<Point[]>(mapData.points);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
				<MapControls mapData={mapData} points={points} />
				{mapData.image && (
					<Grid>
						<Button
							component={Link}
							href={`/api/maps/${mapData.id}/video`}
							variant='contained'>
							Video Sync
						</Button>
					</Grid>
				)}
				<Grid size={12} sx={{ height: 'calc(100vh - 56px)' }}>
					{mapData.image ? (
						<RatioContainer width={1} height={1}>
							<ImageRouteEditor
								alt={mapData.name}
								imageSrc={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.image}`}
								points={points}
								setPoints={setPoints}
								sx={{ aspectRatio: 1 }}
								getInitialPosition={(containerSize) =>
									calculateOptimalZoom(mapData.points, containerSize, 0.75)
								}
								RenderPoint={EditRouteRenderPoint}
								RenderPath={RouteRenderPath}
								RenderExtra={RouteRenderExtra(mapData?.text)}
							/>
						</RatioContainer>
					) : (
						<Typography>No Image Found</Typography>
					)}
				</Grid>
			</Grid>
		</Container>
	);
}
