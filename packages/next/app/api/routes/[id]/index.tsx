'use client';

import FormattedTextField from '@/components/formattedTextField';
import ImageRoute from '@/components/imageRoute';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Box,
	Container,
	Grid,
	IconButton,
	Link as MuiLink,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	TextField,
	Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { filter, indexBy, pipe, prop, sortBy } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../../../farming/render';
import { formatLabel } from '../../maps/formUtils';
import { type MapData, type RouteData } from '../types';
import RouteControls from './controls';

const EditMapDataModal = dynamicModal(() => import('../../maps/editMapDataModal'));

type SortKey =
	| 'name'
	| 'owner'
	| 'notes'
	| 'type'
	| 'background'
	| 'spots'
	| 'mora'
	| 'time'
	| 'efficiency';

export default function Route({
	routeData,
	mapsData,
}: {
	routeData: RouteData;
	mapsData: MapData[];
}) {
	const { showModal } = useModal();
	const [routeMaps, setRouteMaps] = useState<string[]>(routeData.maps);
	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
	const [search, setSearch] = useState('');

	const routeMapData = useMemo(
		() =>
			routeMaps
				.map((id) => mapsData.find((map) => map.id === id))
				.filter((item): item is MapData => Boolean(item)),
		[routeMaps, mapsData],
	);

	const points = useMemo(
		() =>
			routeMapData
				.filter((item) => item.x !== undefined && item.y !== undefined)
				.map((item) => ({ x: item.x!, y: item.y!, type: item.type })),
		[routeMapData],
	);
	const totalSpots = useMemo(
		() => routeMapData.reduce((sum, item) => sum + (item.spots ?? 0), 0),
		[routeMapData],
	);

	const sortedMaps = useMemo(() => {
		const query = search.trim().toLowerCase();
		const numericSortKeys: SortKey[] = ['spots', 'mora', 'time', 'efficiency'];
		const routeOrderMap = indexBy(
			routeMapData.map((data, index) => ({ ...data, index })),
			prop('id'),
		);

		return pipe(
			mapsData,
			filter((item) => {
				if (!query) return true;
				const location = item.background ? formatLabel(item.background) : 'No Location';
				const type = item.type ? formatLabel(item.type) : 'Normal';
				return [item.name, location, item.notes ?? '', type].some((value) =>
					value.toLowerCase().includes(query),
				);
			}),
			sortBy(
				(item) => routeOrderMap[item.id]?.index ?? Number.MAX_VALUE,
				[
					(item) =>
						numericSortKeys.includes(sortKey)
							? Number(item[sortKey] ?? 0)
							: String(item[sortKey] ?? ''),
					direction,
				],
			),
		);
	}, [mapsData, routeMapData, search, sortKey, direction]);

	const header = (label: string, key: SortKey) => (
		<TableCell>
			<TableSortLabel
				active={sortKey === key}
				direction={sortKey === key ? direction : 'asc'}
				onClick={() => {
					if (sortKey === key) setDirection((v) => (v === 'asc' ? 'desc' : 'asc'));
					else {
						setSortKey(key);
						setDirection('asc');
					}
				}}>
				{label}
			</TableSortLabel>
		</TableCell>
	);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
				<RouteControls routeData={routeData} maps={routeMaps} />
				<Grid size={12} sx={{ aspectRatio: '16 / 9' }}>
					<ImageRoute
						points={points}
						RenderPoint={MapRenderPoint}
						RenderPath={MapRenderPath}
						RenderExtra={MapRenderExtra}
						sx={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
						<Image
							fill
							alt='teyvat'
							src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
							style={{ zIndex: -1, objectFit: 'contain' }}
						/>
					</ImageRoute>
				</Grid>
				<Grid size={12}>
					<Paper sx={{ p: 1, mb: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography variant='subtitle1'>Total: {totalSpots} Spots</Typography>
							<TextField
								fullWidth={false}
								size='small'
								label='Search'
								placeholder='Name, Location, Notes, Type'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								sx={{ minWidth: 300 }}
							/>
						</Box>
					</Paper>
					<TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 104px)' }}>
						<Table size='small' stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Order</TableCell>
									{header('Name', 'name')}
									{header('Location', 'background')}
									{header('Owner', 'owner')}
									{header('Notes', 'notes')}
									{header('Type', 'type')}
									{header('Spots', 'spots')}
									{header('Mora', 'mora')}
									{header('Time', 'time')}
									{header('Efficiency', 'efficiency')}
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{sortedMaps.map((item) => {
									const index = routeMaps.indexOf(item.id);
									const inRoute = index !== -1;

									return (
										<TableRow key={item.id} hover selected={inRoute}>
											<TableCell>
												<FormattedTextField
													size='small'
													value={inRoute ? String(index) : ''}
													placeholder='-'
													slotProps={{ htmlInput: { inputMode: 'numeric' } }}
													onBlur={(e) => {
														const parsedOrder = Number.parseInt(
															e.target.value.trim(),
															10,
														);
														if (Number.isNaN(parsedOrder)) return;

														setRouteMaps((data) => {
															const withoutCurrent = data.filter(
																(mapId) => mapId !== item.id,
															);
															const clampedOrder = Math.min(
																Math.max(parsedOrder, 0),
																withoutCurrent.length,
															);
															withoutCurrent.splice(clampedOrder, 0, item.id);
															return withoutCurrent;
														});
													}}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															(e.target as HTMLInputElement).blur();
														}
													}}
													sx={{ width: 64 }}
												/>
											</TableCell>
											<TableCell>
												<MuiLink
													component={Link}
													href={`/api/maps/${item.id}`}
													underline='hover'>
													{item.name}
												</MuiLink>
											</TableCell>
											<TableCell>
												{item.background ? formatLabel(item.background) : 'No Location'}
											</TableCell>
											<TableCell>{item.owner ?? '-'}</TableCell>
											<TableCell>{item.notes ?? '-'}</TableCell>
											<TableCell>
												{item.type ? formatLabel(item.type) : 'Normal'}
											</TableCell>
											<TableCell>{item.spots ?? 0}</TableCell>
											<TableCell>{item.mora ?? 0}</TableCell>
											<TableCell>{item.time ?? 0}</TableCell>
											<TableCell>{item.efficiency ?? 0}</TableCell>
											<TableCell>
												<Box sx={{ display: 'flex' }}>
													{inRoute ? (
														<IconButton
															size='small'
															onClick={() => {
																setRouteMaps((data) =>
																	data.filter((id) => id !== item.id),
																);
															}}>
															<DeleteIcon fontSize='small' />
														</IconButton>
													) : (
														<IconButton
															size='small'
															onClick={() => {
																setRouteMaps((data) => [...data, item.id]);
															}}>
															<AddIcon fontSize='small' />
														</IconButton>
													)}
													<IconButton
														size='small'
														onClick={() =>
															showModal(EditMapDataModal, {
																props: { mapData: item },
															})
														}>
														<EditIcon fontSize='small' />
													</IconButton>
												</Box>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			</Grid>
		</Container>
	);
}
