import { type Point } from '@/components/imageRoutePath/types';
import { Button, Grid, Stack, Typography } from '@mui/material';

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
			<Typography variant='subtitle2' fontWeight='bold'>
				{name} Point (Index: {pointIndex})
			</Typography>
			<Stack spacing={1} direction='row' sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
				<Typography>Artifact Time</Typography>
				<Button
					size='small'
					variant='contained'
					onClick={() => updatePointField(pointIndex, 'marked', time)}>
					{point.marked !== undefined ? `${point.marked.toFixed(2)} sec` : 'Not set'}
				</Button>
				<Button
					size='small'
					variant='contained'
					onClick={() => updatePointField(pointIndex, 'marked', time + 7 / 60)}>
					+ 7 frames
				</Button>
				<Button
					size='small'
					variant='outlined'
					onClick={() => updatePointField(pointIndex, 'marked', undefined)}
					disabled={point.marked === undefined}>
					Reset
				</Button>
			</Stack>
			<Stack direction='row' spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
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
			<Stack direction='row' spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
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
		</Grid>
	);
}
