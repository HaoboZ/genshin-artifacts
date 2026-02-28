'use client';

import RatioContainer from '@/components/ratioContainer';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import {
	Add as AddIcon,
	EditLocationAlt as EditLocationAltIcon,
	FmdGood as FmdGoodIcon,
} from '@mui/icons-material';
import {
	Button,
	Container,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Paper,
	Typography,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { filter, groupBy, pipe, prop, sortBy } from 'remeda';
import { type MapData } from '../routes/types';

const AddMapModal = dynamicModal(() => import('./addMapModal'));

function pointKey(x?: number, y?: number) {
	if (x === undefined || y === undefined) return '';
	return `${x}:${y}`;
}

export default function MapList({ items }: { items: MapData[] }) {
	const { showModal } = useModal();
	const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number }>();
	const [movingMapId, setMovingMapId] = useState('');

	const mapsWithLocation = useMemo(
		() => items.filter((item) => item.x !== undefined && item.y !== undefined),
		[items],
	);

	const groupedPoints = useMemo(
		() =>
			pipe(
				mapsWithLocation,
				groupBy((item) => pointKey(item.x, item.y)),
				Object.entries,
				filter(([key]) => Boolean(key)),
			),
		[mapsWithLocation],
	);

	const selectedMaps = useMemo(() => {
		if (!selectedPoint) return [];
		return pipe(
			items,
			filter((item) => pointKey(item.x, item.y) === pointKey(selectedPoint.x, selectedPoint.y)),
			sortBy(prop('name')),
		);
	}, [items, selectedPoint]);

	const unplacedMaps = useMemo(
		() =>
			pipe(
				items,
				filter((item) => item.x === undefined || item.y === undefined),
				sortBy(prop('name')),
			),
		[items],
	);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1}>
				<Grid size={8}>
					<RatioContainer width={16} height={9} sx={{ height: 'calc(100vh - 16px)' }}>
						<Grid
							onClick={async (e) => {
								if (!movingMapId) return;
								const rect = e.currentTarget.getBoundingClientRect();
								const x = (e.clientX - rect.left) / rect.width;
								const y = (e.clientY - rect.top) / rect.height;
								const mapData = items.find((item) => item.id === movingMapId);
								await axios.post(
									`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${movingMapId}.json`,
									{ ...mapData, x, y },
									{ headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` } },
								);
								setMovingMapId('');
								window.location.reload();
							}}
							sx={{
								position: 'relative',
								width: '100%',
								height: '100%',
								cursor: movingMapId ? 'crosshair' : 'default',
							}}>
							<Image
								fill
								alt='teyvat'
								src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
								style={{ objectFit: 'contain' }}
							/>
							{groupedPoints.map(([key, maps]) => {
								const [x, y] = key.split(':').map(Number);
								return (
									<IconButton
										key={key}
										onClick={(e) => {
											e.stopPropagation();
											setSelectedPoint({ x, y });
										}}
										sx={{
											position: 'absolute',
											left: `${x * 100}%`,
											top: `${y * 100}%`,
											transform: 'translate(-50%, -50%)',
											color:
												selectedPoint &&
												pointKey(selectedPoint.x, selectedPoint.y) === key
													? 'warning.main'
													: 'error.main',
										}}>
										<FmdGoodIcon />
										<Typography variant='caption'>{maps.length}</Typography>
									</IconButton>
								);
							})}
						</Grid>
					</RatioContainer>
				</Grid>
				<Grid size={4}>
					<Grid container spacing={1}>
						<Grid>
							<Button
								variant='contained'
								startIcon={<AddIcon />}
								onClick={() => showModal(AddMapModal, { props: selectedPoint ?? {} })}>
								Add Map
							</Button>
						</Grid>
						<Grid>
							<Button component={Link} href='/api/routes' variant='contained'>
								Routes
							</Button>
						</Grid>
						<Grid size={12}>
							<Paper>
								<Typography sx={{ p: 1 }} variant='h6'>
									{selectedPoint ? 'Maps at selected location' : 'Select a map marker'}
								</Typography>
								<List>
									{selectedMaps.map((item) => (
										<ListItem
											key={item.id}
											secondaryAction={
												<IconButton onClick={() => setMovingMapId(item.id)}>
													<EditLocationAltIcon />
												</IconButton>
											}>
											<ListItemButton component={Link} href={`/api/maps/${item.id}`}>
												<ListItemText secondary={`Spots: ${item.spots ?? 0}`}>
													{item.name}
												</ListItemText>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							</Paper>
						</Grid>
						<Grid size={12}>
							<Paper>
								<Typography sx={{ p: 1 }} variant='h6'>
									Unplaced Maps
								</Typography>
								<List>
									{unplacedMaps.map((item) => (
										<ListItem key={item.id}>
											<ListItemButton component={Link} href={`/api/maps/${item.id}`}>
												<ListItemText>{item.name}</ListItemText>
											</ListItemButton>
										</ListItem>
									))}
								</List>
							</Paper>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
}
