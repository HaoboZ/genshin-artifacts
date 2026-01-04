import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import {
	calculateCenterZoom,
	calculateOptimalZoom,
	findSpotByTime,
} from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useMeasure } from 'rooks';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../render';

export default function MapModal({ route, map }: { route: number; map: number }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const [points] = useFetchState<Point[]>(`/points/route_${route}.json`, []);

	const [ref, measurements] = useMeasure();

	const activeSpot = useMemo(() => {
		if (!points) return null;
		return findSpotByTime(points, map + 1);
	}, [map, points]);

	return (
		<DialogWrapper>
			<DialogTitle ref={ref}>Teyvat Map</DialogTitle>
			<RatioContainer width={16} height={9} sx={{ height: (measurements.outerWidth / 16) * 9 }}>
				<ImageRoute
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={(activeSpot) => {
						if (!activeSpot || activeSpot.percentage) return;
						router.push(`/farming/${route}?map=${points[activeSpot.pointIndex].marked - 1}`);
						closeModal();
					}}
					RenderPoint={MapRenderPoint}
					RenderPath={MapRenderPath}
					RenderExtra={MapRenderExtra}
					getInitialPosition={(containerSize) =>
						calculateOptimalZoom(points, containerSize, 0.9)
					}
					getAnimatedPosition={(containerSize) =>
						calculateCenterZoom(activeSpot.point, containerSize, 5)
					}
					sx={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
					<Image
						fill
						alt='teyvat'
						src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/teyvat.png`}
						style={{ zIndex: -1, objectFit: 'contain' }}
					/>
				</ImageRoute>
			</RatioContainer>
		</DialogWrapper>
	);
}
