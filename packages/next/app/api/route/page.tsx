'use client';
import PageContainer from '@/components/page/container';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import useHistory from '@/src/hooks/useHistory';
import useParamState from '@/src/hooks/useParamState';
import {
	Button,
	FormControlLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import RouteMap from '../../farming/routeMap';
import { type Point, type Spot } from '../../farming/routeMap/utils';
import route from '../route.json';
import { savePointsServer } from './actions';

const maps = route[0].maps;

type EditMode = 'add' | 'relocate' | 'insert';

export default function RouteTest() {
	const { enqueueSnackbar } = useSnackbar();

	const [selectedRoute, setSelectedRoute] = useParamState<string>('route', maps[0]);
	const [points, setPoints] = useFetchState<Point[]>(`/points/${selectedRoute}.json`, []);
	const [editMode, setEditMode] = useState<EditMode>('add');
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

	const currentIndex = maps.indexOf(selectedRoute);

	return (
		<PageContainer>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center', py: 1 }}>
				<Button
					variant='outlined'
					onClick={() => {
						if (currentIndex <= 0) return;
						setSelectedRoute(maps[currentIndex - 1]);
					}}
					disabled={currentIndex <= 0}>
					Previous
				</Button>
				<Select value={selectedRoute} onChange={({ target }) => setSelectedRoute(target.value)}>
					{maps.map((routeName) => (
						<MenuItem key={routeName} value={routeName}>
							{routeName}
						</MenuItem>
					))}
				</Select>
				<Button
					variant='outlined'
					onClick={() => {
						if (currentIndex >= maps.length - 1) return;
						setSelectedRoute(maps[currentIndex + 1]);
					}}
					disabled={currentIndex >= maps.length - 1}>
					Next
				</Button>
				<Button variant='contained' disabled={!points.length} onClick={() => setPoints([])}>
					Clear Points
				</Button>
				<Button
					variant='contained'
					onClick={async () => {
						await savePointsServer(points, selectedRoute);
						enqueueSnackbar('Saved', { variant: 'info' });
					}}>
					Save Points
				</Button>
			</Stack>
			<Stack direction='row' spacing={1} sx={{ pb: 1 }}>
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
			<RouteMap
				src={selectedRoute}
				points={points}
				addPoint={
					editMode === 'add' || (applying && activeSpot)
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
				sx={{ height: '90vh', width: 'unset', justifySelf: 'center' }}
			/>
		</PageContainer>
	);
}
