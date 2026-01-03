import { Box, type BoxProps } from '@mui/material';
import { useMeasure } from 'rooks';

export default function RatioContainer({
	width,
	height,
	sx,
	...props
}: {
	width: number;
	height: number;
} & BoxProps) {
	const [ref, measurements] = useMeasure();

	return (
		<Box
			ref={ref}
			sx={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				...sx,
			}}>
			<Box
				sx={{
					aspectRatio: `${width} / ${height}`,
					width: `min(100%, ${(measurements.outerHeight * width) / height}px)`,
					height: `min(100%, ${(measurements.outerWidth * height) / width}px)`,
					position: 'relative',
					bgcolor: 'black',
				}}
				{...props}
			/>
		</Box>
	);
}
