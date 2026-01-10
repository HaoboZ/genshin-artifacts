import { type RouteData } from '@/api/routes/types';
import { Box, Button, MenuItem, Select, Stack } from '@mui/material';
import { type Dispatch } from 'react';

export default function PathSelect({
	route,
	selectedMap,
	setSelectedMap,
}: {
	route: RouteData;
	selectedMap: number;
	setSelectedMap: Dispatch<number>;
}) {
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
			<Select
				size='small'
				value={selectedMap}
				onChange={(e) => setSelectedMap(e.target.value)}
				sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(10px)' }}>
				{route.mapsData.map(({ id, name }, index) => (
					<MenuItem key={id} value={index}>
						{name}
					</MenuItem>
				))}
			</Select>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
				<Button
					variant='contained'
					onClick={() => {
						if (selectedMap <= 0) return;
						setSelectedMap(selectedMap - 1);
					}}
					disabled={selectedMap <= 0}>
					Prev
				</Button>
				<Button
					variant='contained'
					onClick={() => {
						if (selectedMap >= route.maps.length - 1) return;
						setSelectedMap(selectedMap + 1);
					}}
					disabled={selectedMap >= route.maps.length - 1}>
					Next
				</Button>
			</Stack>
		</Box>
	);
}
