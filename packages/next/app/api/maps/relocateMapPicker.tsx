import { Grid } from '@mui/material';
import { ImageMapRoute, type Point } from 'image-map-route';
import Image from 'next/image';

import { TEYVAT_MAP_IMAGE_URL } from '@/constants/map';

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
			<ImageMapRoute
				points={x !== undefined && y !== undefined ? [{ x, y }] : []}
				addPoint={onChange}
				RenderPoint={MapRenderPoint}
				RenderExtra={MapRenderExtra}
				style={{ aspectRatio: '16 / 9' }}>
				<Image fill alt='teyvat' src={TEYVAT_MAP_IMAGE_URL} style={{ objectFit: 'contain' }} />
			</ImageMapRoute>
		</Grid>
	);
}
