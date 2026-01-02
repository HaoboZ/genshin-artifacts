import { Box, type BoxProps } from '@mui/material';

export default function RatioContainer({ width, height, sx, ...props }: BoxProps) {
	return (
		<Box
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
					width: `min(100%, 100vh * ${width} / ${height})`,
					height: `min(100%, 100vw * ${height} / ${width})`,
				}}
				{...props}
			/>
		</Box>
	);
}
