import { Grid } from '@mui/material';
import { ImageRoute, type Point } from 'image-map-route';
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
					style={{ objectFit: 'contain' }}
				/>
			</ImageRoute>
		</Grid>
	);
}
