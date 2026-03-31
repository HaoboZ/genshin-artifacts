import { type RouteData } from '@/api/routes/types';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogContent, DialogTitle } from '@mui/material';
import {
	calculateCenterZoom,
	calculateOptimalZoom,
	findSpotByTime,
	ImageMapRoute,
	type Point,
} from 'image-map-route';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { filter, map, pick, pipe } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../render';

export default function MapModal({
	routeData,
	selectedMap,
}: {
	routeData: RouteData;
	selectedMap: number;
}) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const points = useMemo(() => {
		if (!routeData) return null;
		return pipe(
			routeData?.mapsData,
			filter(({ x, y }) => x !== undefined && y !== undefined),
			map((data, index) => ({ ...pick(data, ['x', 'y', 'type']), marked: index + 1 })),
		) as Point[];
	}, [routeData]);

	const activeSpot = useMemo(() => {
		if (!points) return null;
		return findSpotByTime(points, selectedMap + 1);
	}, [points, selectedMap]);

	return (
		<DialogWrapper>
			<DialogTitle>Teyvat Map</DialogTitle>
			<DialogContent sx={{ aspectRatio: '16 / 9' }}>
				<ImageMapRoute
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={(activeSpot) => {
						if (!activeSpot || activeSpot.percentage) return;
						router.push(
							`/farming/${routeData.id}?map=${points[activeSpot.pointIndex].marked - 1}`,
						);
						closeModal();
					}}
					RenderPoint={MapRenderPoint}
					RenderPath={MapRenderPath}
					RenderExtra={MapRenderExtra}
					getInitialPosition={(containerSize) =>
						calculateOptimalZoom(points, containerSize, 0.9)
					}
					getAnimatedPosition={(containerSize) =>
						calculateCenterZoom(activeSpot.point, containerSize, 2)
					}
					style={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
					<Image
						fill
						alt='teyvat'
						src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
						style={{ objectFit: 'contain' }}
					/>
				</ImageMapRoute>
			</DialogContent>
		</DialogWrapper>
	);
}
