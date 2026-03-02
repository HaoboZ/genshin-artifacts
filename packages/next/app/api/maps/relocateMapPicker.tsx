import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import { Grid } from '@mui/material';
import Image from 'next/image';
import { MapRenderExtra, MapRenderPoint } from '../../farming/render';

export default function RelocateMapPicker({
	x,
	y,
	onChange,
}: {
	x: number;
	y: number;
	onChange: (point: Point) => void;
}) {
	return (
		<Grid size={12}>
			<ImageRoute
				points={x !== undefined && y !== undefined ? [{ x, y }] : []}
				addPoint={onChange}
				RenderPoint={MapRenderPoint}
				RenderExtra={MapRenderExtra}
				sx={{ aspectRatio: '16 / 9' }}>
				<Image
					fill
					alt='teyvat'
					src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
		</Grid>
	);
}
