import { type Route } from '@/api/routes';
import { Button, MenuItem, Select, Stack } from '@mui/material';
import { type Dispatch } from 'react';

export default function PathSelect({
	route,
	selectedMap,
	setSelectedMap,
}: {
	route: Route;
	selectedMap: number;
	setSelectedMap: Dispatch<number>;
}) {
	return (
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
			<Select
				size='small'
				value={selectedMap}
				onChange={({ target }) => setSelectedMap(target.value)}
				sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(10px)' }}>
				{route.maps.map(({ src }, index) => (
					<MenuItem key={src} value={index}>
						{src}
					</MenuItem>
				))}
			</Select>
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
	);
}
