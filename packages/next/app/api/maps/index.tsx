'use client';

import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import {
	Button,
	Container,
	Link as MuiLink,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { type MapData } from '../routes/types';

const AddMapModal = dynamicModal(() => import('./addMapModal'));
const MapMetadataModal = dynamicModal(() => import('./mapMetadataModal'));

type SortKey =
	| 'name'
	| 'owner'
	| 'type'
	| 'background'
	| 'spots'
	| 'time'
	| 'count'
	| 'mora'
	| 'efficiency'
	| 'x'
	| 'y';

export default function MapList({ items }: { items: MapData[] }) {
	const { showModal } = useModal();
	const [sortBy, setSortBy] = useState<SortKey>('name');
	const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

	const sortedItems = useMemo(() => {
		const mul = direction === 'asc' ? 1 : -1;
		return [...items].sort((a, b) => {
			const av = (a[sortBy] ?? '') as string | number;
			const bv = (b[sortBy] ?? '') as string | number;
			if (typeof av === 'number' || typeof bv === 'number') {
				return ((Number(av) || 0) - (Number(bv) || 0)) * mul;
			}
			return String(av).localeCompare(String(bv)) * mul;
		});
	}, [items, sortBy, direction]);

	const header = (label: string, key: SortKey) => (
		<TableCell>
			<TableSortLabel
				active={sortBy === key}
				direction={sortBy === key ? direction : 'asc'}
				onClick={() => {
					if (sortBy === key) setDirection((v) => (v === 'asc' ? 'desc' : 'asc'));
					else {
						setSortBy(key);
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
					onClick={() => showModal(AddMapModal)}>
					Add Map
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
							{header('Owner', 'owner')}
							{header('Type', 'type')}
							{header('Background', 'background')}
							{header('Spots', 'spots')}
							{header('Time', 'time')}
							{header('Count', 'count')}
							{header('Mora', 'mora')}
							{header('Efficiency', 'efficiency')}
							{header('X', 'x')}
							{header('Y', 'y')}
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
								<TableCell>{item.owner ?? '-'}</TableCell>
								<TableCell>{item.type ?? '-'}</TableCell>
								<TableCell>{item.background ?? '-'}</TableCell>
								<TableCell>{item.spots ?? 0}</TableCell>
								<TableCell>{item.time ?? 0}</TableCell>
								<TableCell>{item.count ?? 0}</TableCell>
								<TableCell>{item.mora ?? 0}</TableCell>
								<TableCell>{item.efficiency ?? 0}</TableCell>
								<TableCell>{item.x ?? '-'}</TableCell>
								<TableCell>{item.y ?? '-'}</TableCell>
								<TableCell>
									<Button
										size='small'
										startIcon={<EditIcon />}
										onClick={() =>
											showModal(MapMetadataModal, {
												props: {
													mapData: item,
													onSaved: () => window.location.reload(),
												},
											})
										}>
										Edit
									</Button>
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
