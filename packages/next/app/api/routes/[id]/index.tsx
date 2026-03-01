'use client';

import FormattedTextField from '@/components/formattedTextField';
import ImageRoute from '@/components/imageRoute';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Box,
	Container,
	FormControlLabel,
	Grid,
	IconButton,
	Paper,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridSortModel } from '@mui/x-data-grid';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { filter, indexBy, pipe, prop, sortBy, toTitleCase } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../../../farming/render';
import { CALC_EFFICIENCY_SECONDS } from '../../maps/formUtils';
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
type RouteMapRow = MapData & { order?: number; actions?: never };

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
	const totalSpots = useMemo(
		() => routeMapData.reduce((sum, item) => sum + (item.spots ?? 0), 0),
		[routeMapData],
	);
	const totalTime = useMemo(
		() => routeMapData.reduce((sum, item) => sum + (item.time ?? 0) + CALC_EFFICIENCY_SECONDS, 0),
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
				const location = toTitleCase(item.background || 'None');
				const type = toTitleCase(item.type || '');
				const matchesSearch =
					!query ||
					[item.name, location, item.notes ?? '', type].some((value) =>
						value.toLowerCase().includes(query),
					);
				const matchesSpotsMora =
					!moraOnly || Number(item.spots ?? 0) === Number(item.mora ?? 0);
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

	const handleSortModelChange = (model: GridSortModel) => {
		if (!model.length) {
			setSortKey('name');
			setDirection('asc');
			return;
		}
		const { field, sort } = model[0];
		if (!sort) return;
		setSortKey(field as SortKey);
		setDirection(sort);
	};

	const columns: GridColDef<RouteMapRow>[] = [
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
		{ field: 'name', headerName: 'Name', flex: 2, minWidth: 150, sortable: true },
		{
			field: 'background',
			headerName: 'Location',
			flex: 1,
			minWidth: 100,
			sortable: true,
			valueGetter: (value) => toTitleCase(value || 'None'),
		},
		{ field: 'owner', headerName: 'Owner', flex: 1, minWidth: 100, sortable: true },
		{ field: 'notes', headerName: 'Notes', flex: 2, minWidth: 100, sortable: true },
		{
			field: 'type',
			headerName: 'Type',
			flex: 1,
			minWidth: 100,
			sortable: true,
			valueGetter: (value) => toTitleCase(value || ''),
		},
		{
			field: 'spots',
			headerName: 'Spots',
			width: 75,
			type: 'number',
			sortable: true,
			valueGetter: (value) => value ?? 0,
		},
		{
			field: 'mora',
			headerName: 'Mora',
			width: 75,
			type: 'number',
			sortable: true,
			valueGetter: (value) => value ?? 0,
		},
		{
			field: 'time',
			headerName: 'Time',
			width: 75,
			type: 'number',
			sortable: true,
			valueGetter: (value) => value ?? 0,
		},
		{
			field: 'efficiency',
			headerName: 'Efficiency',
			width: 100,
			type: 'number',
			sortable: true,
			valueGetter: (value: number) => (value ?? 0).toFixed(2),
		},
		{
			field: 'actions',
			headerName: 'Actions',
			width: 100,
			sortable: false,
			filterable: false,
			renderCell: ({ row }) => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
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
				</Box>
			),
		},
	];

	const sortModel: GridSortModel = [{ field: sortKey, sort: direction }];

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
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
							<Typography variant='subtitle1'>
								Total: {totalSpots} spots, {(totalTime / 60).toFixed(2)} min
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
								sx={{ pl: 1 }}
							/>
						</Box>
					</Paper>
					<DataGrid
						rows={sortedMaps}
						columns={columns}
						density='compact'
						disableRowSelectionOnClick
						disableColumnMenu
						sortingMode='server'
						sortModel={sortModel}
						onSortModelChange={handleSortModelChange}
					/>
				</Grid>
			</Grid>
		</Container>
	);
}
