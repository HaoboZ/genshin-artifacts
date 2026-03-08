'use client';

import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, Container, IconButton, Paper, Stack, TextField } from '@mui/material';
import { DataGrid, type GridColDef, type GridSortModel } from '@mui/x-data-grid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { sortBy } from 'remeda';
import { deleteRoute } from './actions';
import { type RouteData } from './types';

const AddRouteDataModal = dynamicModal(() => import('./addRouteDataModal'));
const EditRouteDataModal = dynamicModal(() => import('./editRouteDataModal'));

type SortKey = 'name' | 'owner' | 'notes' | 'maps';
type RouteRow = RouteData & { actions?: never };

export default function RouteList({ items }: { items: RouteData[] }) {
	const router = useRouter();
	const { showModal } = useModal();
	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
	const [search, setSearch] = useState('');

	const filteredItems = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return items;
		return items.filter((item) => {
			return [item.name, '', item.notes ?? '', ''].some((value) =>
				value.toLowerCase().includes(query),
			);
		});
	}, [items, search]);

	const sortedItems = useMemo(() => {
		return sortBy(filteredItems, [
			(item) => (sortKey === 'maps' ? (item.maps?.length ?? 0) : String(item[sortKey] ?? '')),
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

	const columns: GridColDef<RouteRow>[] = [
		{ field: 'name', headerName: 'Name', flex: 2, minWidth: 200, sortable: true },
		{ field: 'owner', headerName: 'Owner', flex: 1, minWidth: 150, sortable: true },
		{ field: 'notes', headerName: 'Notes', flex: 2, minWidth: 250, sortable: true },
		{
			field: 'maps',
			headerName: 'Maps',
			width: 100,
			type: 'number',
			sortable: true,
			valueGetter: (value: string[]) => value?.length ?? 0,
		},
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
							showModal(EditRouteDataModal, { props: { routeData: row } });
						}}>
						<EditIcon fontSize='small' />
					</IconButton>
					<IconButton
						size='small'
						onClick={async (e) => {
							e.stopPropagation();
							if (!confirm(`Delete route "${row.name}"? This cannot be undone.`)) return;
							await deleteRoute(row.id);
							router.refresh();
						}}>
						<DeleteIcon fontSize='small' color='error' />
					</IconButton>
				</Stack>
			),
		},
	];

	const sortModel: GridSortModel = [{ field: sortKey, sort: direction }];

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
					onClick={() => showModal(AddRouteDataModal)}>
					Add Route
				</Button>
				<TextField
					fullWidth={false}
					size='small'
					label='Search'
					placeholder='Name, Notes'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ minWidth: 300 }}
				/>
				<Button component={Link} href='/api/maps' variant='contained'>
					Maps
				</Button>
				<Button component={Link} href='/api/routes/auth' variant='contained'>
					Authorize
				</Button>
			</Stack>
			<DataGrid
				rows={sortedItems}
				columns={columns}
				density='compact'
				disableRowSelectionOnClick
				sortingMode='server'
				sortModel={sortModel}
				onSortModelChange={handleSortModelChange}
				onRowClick={({ row }) => router.push(`/api/routes/${row.id}`)}
				sx={{ 'border': 0, '.MuiDataGrid-row:hover': { cursor: 'pointer' } }}
			/>
		</Container>
	);
}
