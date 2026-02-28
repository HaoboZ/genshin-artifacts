import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import {
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	MenuItem,
	TextField,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { type BackgroundType, type MapData, type MapType } from '../routes/types';

const MAP_TYPES: MapType[] = ['normal', 'extend', 'scan'];
const BACKGROUND_TYPES: BackgroundType[] = [
	'mondstadt',
	'liyue',
	'inazuma',
	'sumeru',
	'fontaine',
	'natlan',
	'snezhnaya',
];

export default function MapMetadataModal({
	mapData,
	onSaved,
}: {
	mapData: MapData;
	onSaved?: (mapData: MapData) => void;
}) {
	const { closeModal } = useModalControls();

	const [name, setName] = useState(mapData.name ?? '');
	const [owner, setOwner] = useState(mapData.owner ?? '');
	const [type, setType] = useState<MapType>(mapData.type ?? 'normal');
	const [background, setBackground] = useState<BackgroundType>(mapData.background ?? 'mondstadt');
	const [spots, setSpots] = useState<number>(mapData.spots ?? 0);
	const [time, setTime] = useState<number>(mapData.time ?? 0);
	const [count, setCount] = useState<number>(mapData.count ?? 0);
	const [mora, setMora] = useState<number>(mapData.mora ?? 0);
	const [efficiency, setEfficiency] = useState<number>(mapData.efficiency ?? 0);
	const [x, setX] = useState<number>(mapData.x ?? 0);
	const [y, setY] = useState<number>(mapData.y ?? 0);

	return (
		<DialogWrapper maxWidth='sm'>
			<DialogTitle>Edit Map Details</DialogTitle>
			<DialogContent>
				<Grid container spacing={1} sx={{ pt: 1 }}>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Owner'
							value={owner}
							onChange={(e) => setOwner(e.target.value)}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							select
							label='Type'
							value={type}
							onChange={(e) => setType(e.target.value as MapType)}>
							{MAP_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{value}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							select
							label='Background'
							value={background}
							onChange={(e) => setBackground(e.target.value as BackgroundType)}>
							{BACKGROUND_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{value}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Spots'
							value={spots}
							onChange={(e) => setSpots(+e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Time'
							inputProps={{ step: '0.1' }}
							value={time}
							onChange={(e) => setTime(+e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Count'
							value={count}
							onChange={(e) => setCount(+e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Mora'
							value={mora}
							onChange={(e) => setMora(+e.target.value)}
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Efficiency'
							inputProps={{ step: '0.1' }}
							value={efficiency}
							onChange={(e) => setEfficiency(+e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='X'
							value={x}
							onChange={(e) => setX(+e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Y'
							value={y}
							onChange={(e) => setY(+e.target.value)}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						const data: MapData = {
							...mapData,
							name,
							owner: owner || undefined,
							type,
							background,
							spots,
							time,
							count,
							mora,
							efficiency,
							x,
							y,
						};
						await axios.post(
							`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}.json`,
							data,
							{
								headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` },
							},
						);
						onSaved?.(data);
						closeModal();
					}}>
					Save
				</AsyncButton>
			</DialogActions>
		</DialogWrapper>
	);
}
