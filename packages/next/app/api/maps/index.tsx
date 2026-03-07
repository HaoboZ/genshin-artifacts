'use client';

import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Button,
	Container,
	FormControlLabel,
	IconButton,
	Paper,
	Stack,
	Switch,
	TextField,
} from '@mui/material';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { sortBy, toTitleCase } from 'remeda';
import { type MapData } from '../routes/types';
import { mapColumns, type SortKey } from './columns';

const AddMapDataModal = dynamicModal(() => import('./addMapDataModal'));
const EditMapDataModal = dynamicModal(() => import('./editMapDataModal'));

export default function MapList({ items }: { items: MapData[] }) {
	const router = useRouter();
	const { showModal } = useModal();

	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
	const [search, setSearch] = useState('');
	const [moraOnly, setMoraOnly] = useState(false);

	const filteredItems = useMemo(() => {
		const query = search.trim().toLowerCase();
		return items.filter((item) => {
			const location = toTitleCase(item.background || 'None');
			const type = toTitleCase(item.type || '');
			const matchesSearch =
				!query ||
				[item.name, location, item.notes ?? '', type].some((value) =>
					value.toLowerCase().includes(query),
				);
			const matchesSpotsMora = !moraOnly || Number(item.spots ?? 0) === Number(item.mora ?? 0);
			return matchesSearch && matchesSpotsMora;
		});
	}, [items, search, moraOnly]);

	const sortedItems = useMemo(() => {
		const numericSortKeys: SortKey[] = ['spots', 'mora', 'time', 'efficiency'];
		return sortBy(filteredItems, [
			(item) =>
				numericSortKeys.includes(sortKey)
					? Number(item[sortKey] ?? 0)
					: String(item[sortKey] ?? ''),
			direction,
		]);
	}, [filteredItems, sortKey, direction]);

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

	const columns = useMemo(() => {
		return [
			...mapColumns,
			{
				field: 'actions',
				headerName: 'Actions',
				width: 100,
				sortable: false,
				filterable: false,
				renderCell: ({ row }) => (
					<Stack direction='row' spacing={0.5}>
						<IconButton
							size='small'
							onClick={(e) => {
								e.stopPropagation();
								showModal(EditMapDataModal, { props: { mapData: row } });
							}}>
							<EditIcon fontSize='small' />
						</IconButton>
						<IconButton
							size='small'
							onClick={async (e) => {
								e.stopPropagation();
								if (!confirm(`Delete map "${row.name}"? This cannot be undone.`)) return;
								await axios.delete(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${row.id}`, {
									headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` },
								});
								router.refresh();
							}}>
							<DeleteIcon fontSize='small' color='error' />
						</IconButton>
					</Stack>
				),
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container>
			<Stack
				direction='row'
				spacing={1}
				component={Paper}
				sx={{ p: 1, mb: 1, alignItems: 'center' }}>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={() => showModal(AddMapDataModal)}>
					Add Map
				</Button>
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
				<Button component={Link} href='/api/routes' variant='contained'>
					Routes
				</Button>
				<Button component={Link} href='/api/routes/auth' variant='contained'>
					Authorize
				</Button>
			</Stack>
			<DataGrid
				rows={sortedItems}
				columns={columns}
				density='compact'
				sortingMode='server'
				sortModel={[{ field: sortKey, sort: direction }]}
				onSortModelChange={handleSortModelChange}
				onRowClick={({ row }) => router.push(`/api/maps/${row.id}`)}
				sx={{
					'border': 0,
					'.MuiDataGrid-row:hover': { cursor: 'pointer' },
					'.mora-match': { color: 'yellow' },
					'.no-video': { color: 'red' },
				}}
			/>
		</Container>
	);
}
