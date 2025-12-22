import { Box, Button, Stack, Typography } from '@mui/material';
import { Point } from '../../../farming/routeMap/utils';

export default function TimePointControls({
	time,
	point,
	pointIndex,
	updatePointTime,
}: {
	time: number;
	point: Point;
	pointIndex: number;
	updatePointTime: (pointIndex: number, field: string, time: number) => void;
}) {
	if (!point) return null;
	return (
		<Box>
			<Typography variant='subtitle2' fontWeight='bold'>
				Current Point (Index: {pointIndex})
			</Typography>
			<Stack direction='row' spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
				<Typography>Start</Typography>
				<Button
					size='small'
					variant='contained'
					onClick={() => updatePointTime(pointIndex, 'start', time)}>
					{point.start !== undefined ? `${point.start.toFixed(2)}s` : 'Not set'}
				</Button>
				<Button
					size='small'
					variant='outlined'
					onClick={() => updatePointTime(pointIndex, 'start', undefined)}
					disabled={point.start === undefined}>
					Reset
				</Button>
			</Stack>
			<Stack direction='row' spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
				<Typography>End</Typography>
				<Button
					size='small'
					variant='contained'
					onClick={() => updatePointTime(pointIndex, 'end', time)}>
					{point.end !== undefined ? `${point.end.toFixed(2)}s` : 'Not set'}
				</Button>
				<Button
					size='small'
					variant='outlined'
					onClick={() => updatePointTime(pointIndex, 'end', undefined)}
					disabled={point.end === undefined}>
					Reset
				</Button>
			</Stack>
		</Box>
	);
}
