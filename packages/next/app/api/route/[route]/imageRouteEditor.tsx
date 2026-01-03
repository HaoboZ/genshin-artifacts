'use client';
import ImageRoute from '@/components/imageRoute';
import { type ImageRouteProps, type Point, type Spot } from '@/components/imageRoute/types';
import useHistory from '@/hooks/useHistory';
import {
	Button,
	FormControlLabel,
	Stack,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import Image from 'next/image';
import { useSnackbar } from 'notistack';
import { type Dispatch, Fragment, type SetStateAction, useState } from 'react';
import { pick } from 'remeda';
import { useKey } from 'rooks';
import { savePointsServer } from './actions';

export default function ImageRouteEditor({
	src,
	route = src,
	points,
	setPoints,
	sx,
	...props
}: {
	src: string;
	route?: string;
	setPoints: Dispatch<SetStateAction<Point[]>>;
} & ImageRouteProps) {
	const { enqueueSnackbar } = useSnackbar();

	const [editMode, setEditMode] = useState<string>('add');
	const [activeSpot, setActiveSpot] = useState<Spot>(null);
	const [applying, setApplying] = useState(true);

	useHistory(points, setPoints);

	useKey(['Delete'], (e) => {
		if (!activeSpot) return;
		e.preventDefault();
		setPoints((points) => {
			const newPoints = [...points];
			newPoints.splice(activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0), 1);
			return newPoints;
		});
		setActiveSpot(null);
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
						await savePointsServer(points, route);
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
			<ImageRoute
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
											const index =
												activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0);
											newPoints[index] = {
												...newPoints[index],
												...pick(point, ['x', 'y']),
											};
											return newPoints;
										case 'insert':
											return points.toSpliced(
												activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0),
												0,
												pick(point, ['x', 'y']),
											);
									}
								});
							}
						: undefined
				}
				activeSpot={activeSpot}
				setActiveSpot={setActiveSpot}
				sx={{ height: '80vh', justifySelf: 'center', opacity: points ? 1 : 0, ...sx }}
				{...props}>
				<Image
					fill
					alt={src}
					src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/maps/${src}.png`}
					style={{ zIndex: -1, objectFit: 'contain' }}
				/>
			</ImageRoute>
		</Fragment>
	);
}
