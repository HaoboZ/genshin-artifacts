'use client';
import PageContainer from '@/components/page/container';
import useEventListener from '@/src/hooks/useEventListener';
import useFetchState from '@/src/hooks/useFetchState';
import { Button, MenuItem, Select, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import RouteMap from '../../farming/routeMap';
import { Point } from '../../farming/routeMap/utils';
import route from '../route.json';
import { savePointsServer } from './actions';

const maps = route[1].maps;

export default function RouteTest() {
	const { enqueueSnackbar } = useSnackbar();

	const [selectedRoute, setSelectedRoute] = useState(maps[0]);
	const [points, setPoints] = useFetchState<Point[]>(`/points/${selectedRoute}.json`, []);

	const currentIndex = maps.indexOf(selectedRoute);

	useEventListener(typeof window !== 'undefined' ? window : null, 'keydown', (e) => {
		if (!e.ctrlKey || e.key !== 'z') return;
		e.preventDefault();
		setPoints((prev) => prev.slice(0, -1));
	});

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
			<RouteMap
				src={selectedRoute}
				points={points}
				setPoints={setPoints}
				sx={{ height: '90vh', width: 'unset', justifySelf: 'center' }}
			/>
		</PageContainer>
	);
}
