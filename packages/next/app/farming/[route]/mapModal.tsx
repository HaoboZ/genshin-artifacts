import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMeasure } from 'rooks';
import { MapRenderPath, MapRenderPoint } from '../render';

export default function MapModal({ route }: { route: number }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const [points] = useFetchState<Point[]>(`/points/route_${route}.json`, []);

	const [ref, measurements] = useMeasure();

	return (
		<DialogWrapper>
			<DialogTitle ref={ref}>Teyvat Map</DialogTitle>
			<RatioContainer width={16} height={9} sx={{ height: (measurements.outerWidth / 16) * 9 }}>
				<ImageRoute
					points={points}
					setActiveSpot={(activeSpot) => {
						if (!activeSpot) return;
						router.push(`/farming/${route}?map=${points[activeSpot.pointIndex].marked - 1}`);
						closeModal();
					}}
					RenderPoint={MapRenderPoint}
					RenderPath={MapRenderPath}
					initialZoom={0.9}
					disableAnimations
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
