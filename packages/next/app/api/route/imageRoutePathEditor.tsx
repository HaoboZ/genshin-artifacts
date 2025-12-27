'use client';
import ImageRoutePath from '@/components/imageRoutePath';
import { type Point, type Spot } from '@/components/imageRoutePath/types';
import useEventListener from '@/src/hooks/useEventListener';
import useHistory from '@/src/hooks/useHistory';
import {
	type BoxProps,
	Button,
	FormControlLabel,
	Stack,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { type Dispatch, Fragment, type SetStateAction, useState } from 'react';
import { savePointsServer } from './actions';

export default function ImageRoutePathEditor({
	src,
	imageSrc = src,
	points,
	setPoints,
	sx,
	...props
}: {
	src: string;
	imageSrc?: string;
	points: Point[];
	setPoints: Dispatch<SetStateAction<Point[]>>;
} & BoxProps) {
	const { enqueueSnackbar } = useSnackbar();

	const [editMode, setEditMode] = useState<string>('add');
	const [activeSpot, setActiveSpot] = useState<Spot>(null);
	const [applying, setApplying] = useState(true);

	useHistory(points, setPoints);

	useEventListener(typeof window !== 'undefined' ? window : null, 'keydown', (e) => {
		if (e.key === 'Delete' && activeSpot) {
			e.preventDefault();
			setPoints((points) => {
				const newPoints = [...points];
				newPoints.splice(activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0), 1);
				return newPoints;
			});
			setActiveSpot(null);
		}
	});

	return (
		<Fragment>
			<Stack direction='row' spacing={1} sx={{ pb: 1 }}>
				<Button variant='contained' disabled={!points?.length} onClick={() => setPoints([])}>
					Clear Points
				</Button>
				<Button
					variant='contained'
					onClick={async () => {
						await savePointsServer(points, src);
						enqueueSnackbar('Saved', { variant: 'info' });
					}}>
					Save Points
				</Button>
				<ToggleButtonGroup
					value={editMode}
					exclusive
					onChange={(_, value) => setEditMode(value)}>
					<ToggleButton value='add'>Add Points</ToggleButton>
					<ToggleButton value='relocate'>Relocate Point</ToggleButton>
					<ToggleButton value='insert'>Insert Points</ToggleButton>
				</ToggleButtonGroup>
				<FormControlLabel
					label='Applying'
					control={
						<Switch
							checked={applying}
							onChange={({ target }) => setApplying(target.checked)}
						/>
					}
				/>
				<Button variant='contained' onClick={() => setActiveSpot(null)}>
					Clear Active
				</Button>
			</Stack>
			<ImageRoutePath
				src={imageSrc}
				points={points}
				addPoint={
					editMode === 'add' || (applying && activeSpot?.pointIndex !== undefined)
						? (point) => {
								setPoints((points) => {
									switch (editMode) {
										case 'add':
											return [...points, point];
										case 'relocate':
											const newPoints = [...points];
											newPoints[
												activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0)
											] = point;
											return newPoints;
										case 'insert':
											return points.toSpliced(
												activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0),
												0,
												point,
											);
									}
								});
							}
						: undefined
				}
				activeSpot={activeSpot}
				setActiveSpot={setActiveSpot}
				sx={{ height: '90vh', justifySelf: 'center', ...sx }}
				{...props}
			/>
		</Fragment>
	);
}
