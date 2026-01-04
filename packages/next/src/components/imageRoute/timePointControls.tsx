import { Button, Grid, Stack, Typography } from '@mui/material';
import { type Point } from './types';

export default function TimePointControls({
	name,
	time,
	point,
	pointIndex,
	updatePointField,
}: {
	name: string;
	time: number;
	point: Point;
	pointIndex: number;
	updatePointField: (pointIndex: number, field: string, time: number) => void;
}) {
	if (!point) return null;

	return (
		<Grid size={6}>
			<Stack spacing={1}>
				<Typography variant='subtitle2' fontWeight='bold'>
					{name} Point (Index: {pointIndex})
				</Typography>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Start</Typography>
					<Button
						size='small'
						variant='contained'
						onClick={() => updatePointField(pointIndex, 'start', time)}>
						{point.start !== undefined ? `${point.start.toFixed(2)} sec` : 'Not set'}
					</Button>
					<Button
						size='small'
						variant='outlined'
						onClick={() => updatePointField(pointIndex, 'start', undefined)}
						disabled={point.start === undefined}>
						Reset
					</Button>
				</Stack>
				<Stack spacing={1} direction='row' sx={{ alignItems: 'center' }}>
					<Typography>Marked</Typography>
					<Button
						size='small'
						variant='contained'
						onClick={() => updatePointField(pointIndex, 'marked', time)}>
						{point.marked !== undefined ? `${point.marked.toFixed(2)} sec` : 'Not set'}
					</Button>
					<Button
						size='small'
						variant='outlined'
						onClick={() => updatePointField(pointIndex, 'marked', undefined)}
						disabled={point.marked === undefined}>
						Reset
					</Button>
				</Stack>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>End</Typography>
					<Button
						size='small'
						variant='contained'
						onClick={() => updatePointField(pointIndex, 'end', time)}>
						{point.end !== undefined ? `${point.end.toFixed(2)} sec` : 'Not set'}
					</Button>
					<Button
						size='small'
						variant='outlined'
						onClick={() => updatePointField(pointIndex, 'end', undefined)}
						disabled={point.end === undefined}>
						Reset
					</Button>
				</Stack>
			</Stack>
		</Grid>
	);
}
