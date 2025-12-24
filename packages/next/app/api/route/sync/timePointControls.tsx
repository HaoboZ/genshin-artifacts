import { Button, Grid, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import { Point } from '../../../farming/routeMap/utils';

export default function TimePointControls({
	time,
	point,
	pointIndex,
	updatePointField,
}: {
	time: number;
	point: Point;
	pointIndex: number;
	updatePointField: (pointIndex: number, field: string, time: number) => void;
}) {
	if (!point) return null;
	return (
		<Grid size={6}>
			<Typography variant='subtitle2' fontWeight='bold'>
				Current Point (Index: {pointIndex})
			</Typography>
			{point.artifact && (
				<Fragment>
					<Typography>Artifact Time</Typography>
					<Button
						size='small'
						variant='contained'
						onClick={() => updatePointField(pointIndex, 'artifact', time)}>
						{point.artifact.toFixed(2)} sec
					</Button>
					<Button
						size='small'
						variant='contained'
						onClick={() => updatePointField(pointIndex, 'artifact', time + 7 / 60)}>
						+ 7 frames
					</Button>
				</Fragment>
			)}
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
