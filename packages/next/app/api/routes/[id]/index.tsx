'use client';

import FormattedTextField from '@/components/formattedTextField';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Container,
	FormControlLabel,
	Grid,
	IconButton,
	Paper,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ImageRoute } from 'image-map-route';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { filter, indexBy, pipe, prop, sortBy, toTitleCase } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../../../farming/render';
import { mapColumns, type SortKey } from '../../maps/columns';
import { CALC_EFFICIENCY_SECONDS } from '../../maps/formUtils';
import { type MapData, type RouteData } from '../types';
import RouteControls from './controls';

const EditMapDataModal = dynamicModal(() => import('../../maps/editMapDataModal'));

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
	const [moraOnly, setMoraOnly] = useState(false);

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
	const [spots, mora] = useMemo(() => {
		return [
			routeMapData.reduce((sum, item) => sum + item.spots, 0),
			routeMapData.reduce((sum, item) => sum + item.mora, 0),
		];
	}, [routeMapData]);

	const time = useMemo(() => {
		const totalTime = routeMapData.reduce(
			(sum, item) => sum + item.time + CALC_EFFICIENCY_SECONDS,
			0,
		);
		const min = Math.floor(totalTime / 60);
		const sec = Math.floor(totalTime % 60);
		return `${min}:${sec.toString().padStart(2, '0')}`;
	}, [routeMapData]);

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
				const location = toTitleCase(item.background || 'None');
				const type = toTitleCase(item.type || '');
				const matchesSearch =
					!query ||
					[item.name, location, item.notes ?? '', type].some((value) =>
						value.toLowerCase().includes(query),
					);
				const matchesSpotsMora = !moraOnly || (item.spots && item.spots === item.mora);
				return matchesSearch && matchesSpotsMora;
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
	}, [mapsData, routeMapData, search, sortKey, direction, moraOnly]);

	const columns = useMemo(() => {
		return [
			{
				field: 'order',
				headerName: 'Order',
				width: 75,
				sortable: false,
				filterable: false,
				renderCell: ({ row }) => {
					const index = routeMaps.indexOf(row.id);
					return (
						<FormattedTextField
							size='small'
							value={index !== -1 ? String(index) : ''}
							placeholder='-'
							slotProps={{ htmlInput: { inputMode: 'numeric' } }}
							sx={{ '.MuiInputBase-input': { py: 0.7 } }}
							onBlur={(e) => {
								const parsedOrder = Number.parseInt(e.target.value.trim(), 10);
								if (Number.isNaN(parsedOrder)) return;

								setRouteMaps((data) => {
									const withoutCurrent = data.filter((mapId) => mapId !== row.id);
									const clampedOrder = Math.min(
										Math.max(parsedOrder, 0),
										withoutCurrent.length,
									);
									withoutCurrent.splice(clampedOrder, 0, row.id);
									return withoutCurrent;
								});
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									(e.target as HTMLInputElement).blur();
								}
							}}
						/>
					);
				},
			},
			...mapColumns,
			{
				field: 'actions',
				headerName: 'Actions',
				width: 100,
				sortable: false,
				filterable: false,
				renderCell: ({ row }) => (
					<Stack direction='row' spacing={0.5}>
						{routeMaps.includes(row.id) ? (
							<IconButton
								size='small'
								onClick={() => setRouteMaps((data) => data.filter((id) => id !== row.id))}>
								<DeleteIcon fontSize='small' />
							</IconButton>
						) : (
							<IconButton
								size='small'
								onClick={() => setRouteMaps((data) => [...data, row.id])}>
								<AddIcon fontSize='small' />
							</IconButton>
						)}
						<IconButton
							size='small'
							onClick={() => showModal(EditMapDataModal, { props: { mapData: row } })}>
							<EditIcon fontSize='small' />
						</IconButton>
					</Stack>
				),
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeMaps]);

	return (
		<Container>
			<Grid container spacing={1}>
				<Grid size={12}>
					<RouteControls routeData={routeData} maps={routeMaps} />
				</Grid>
				<Grid size={12}>
					<ImageRoute
						points={points}
						RenderPoint={MapRenderPoint}
						RenderPath={MapRenderPath}
						RenderExtra={MapRenderExtra}
						sx={{ aspectRatio: '16 / 9', opacity: points ? 1 : 0 }}>
						<Image
							fill
							alt='teyvat'
							src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
							style={{ objectFit: 'contain' }}
						/>
					</ImageRoute>
				</Grid>
				<Grid size={12}>
					<Stack
						direction='row'
						spacing={1}
						component={Paper}
						sx={{ p: 1, alignItems: 'center' }}>
						<Typography variant='subtitle1'>
							Total: {spots} spots, {mora} mora, {time} min
						</Typography>
						<TextField
							fullWidth={false}
							size='small'
							label='Search'
							placeholder='Name, Location, Notes, Type'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							sx={{ minWidth: 300 }}
						/>
						<FormControlLabel
							control={
								<Switch
									size='small'
									checked={moraOnly}
									onChange={(event) => setMoraOnly(event.target.checked)}
								/>
							}
							label='Mora Only'
						/>
					</Stack>
				</Grid>
				<Grid size={12}>
					<DataGrid
						rows={sortedMaps}
						columns={columns}
						density='compact'
						disableRowSelectionOnClick
						sortingMode='server'
						sortModel={[{ field: sortKey, sort: direction }]}
						onSortModelChange={(model) => {
							if (!model.length) {
								setSortKey('name');
								setDirection('asc');
								return;
							}
							const { field, sort } = model[0];
							if (!sort) return;
							setSortKey(field as SortKey);
							setDirection(sort);
						}}
						sx={{ '.mora-match': { color: '#ffeb3b' } }}
					/>
				</Grid>
			</Grid>
		</Container>
	);
}
