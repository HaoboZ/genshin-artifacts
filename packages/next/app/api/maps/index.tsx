'use client';

import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Box,
	Button,
	Container,
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
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { sortBy } from 'remeda';
import { type MapData } from '../routes/types';
import { formatLabel } from './formUtils';

const AddMapDataModal = dynamicModal(() => import('./addMapDataModal'));
const EditMapDataModal = dynamicModal(() => import('./editMapDataModal'));

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

export default function MapList({ items }: { items: MapData[] }) {
	const router = useRouter();
	const { showModal } = useModal();
	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
	const [search, setSearch] = useState('');

	const filteredItems = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return items;
		return items.filter((item) => {
			const location = item.background ? formatLabel(item.background) : 'No Location';
			const type = item.type ? formatLabel(item.type) : 'Normal';
			return [item.name, location, item.notes ?? '', type].some((value) =>
				value.toLowerCase().includes(query),
			);
		});
	}, [items, search]);

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
			<Paper sx={{ p: 1, mb: 1, display: 'flex', gap: 1 }}>
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
				<Button component={Link} href='/api/maps/auth' variant='contained'>
					Authorize
				</Button>
				<Button component={Link} href='/api/routes' variant='contained'>
					Routes
				</Button>
			</Paper>
			<TableContainer component={Paper}>
				<Table size='small'>
					<TableHead>
						<TableRow>
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
						{sortedItems.map((item) => (
							<TableRow key={item.id}>
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
								<TableCell>{item.type ? formatLabel(item.type) : 'Normal'}</TableCell>
								<TableCell>{item.spots ?? 0}</TableCell>
								<TableCell>{item.mora ?? 0}</TableCell>
								<TableCell>{item.time ?? 0}</TableCell>
								<TableCell>{item.efficiency ?? 0}</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex' }}>
										<IconButton
											size='small'
											onClick={() => {
												showModal(EditMapDataModal, { props: { mapData: item } });
											}}>
											<EditIcon fontSize='small' />
										</IconButton>
										<IconButton
											size='small'
											onClick={async () => {
												await axios.delete(
													`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${item.id}`,
													{
														headers: {
															Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}`,
														},
													},
												);
												router.refresh();
											}}>
											<DeleteIcon fontSize='small' color='error' />
										</IconButton>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			{!sortedItems.length && <Typography sx={{ mt: 1 }}>No maps found.</Typography>}
		</Container>
	);
}
