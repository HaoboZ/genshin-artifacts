'use client';
import { useModal } from '@/providers/modal';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { filter, pipe, prop, sortBy } from 'remeda';
import AddRouteModal from './addRouteModal';
import { type RouteData } from './types';

export default function RouteList({ items }: { items: RouteData[] }) {
	const router = useRouter();
	const { showModal } = useModal();

	const [search, setSearch] = useState('');
	const [owner, setOwner] = useState('');

	const filteredItems = useMemo(() => {
		return pipe(
			items,
			filter((item) => {
				if (search && !item.name.toLowerCase().includes(search)) return false;
				return owner ? item.owner === owner : true;
			}),
			sortBy(prop('name')),
		);
	}, [items, search, owner]);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
				<Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Button
						variant='contained'
						startIcon={<AddIcon />}
						onClick={() => showModal(AddRouteModal)}>
						Add Route
					</Button>
				</Grid>
				<Grid>
					<TextField
						label='Filter'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</Grid>
				<Grid>
					<TextField label='Owner' value={owner} onChange={(e) => setOwner(e.target.value)} />
				</Grid>
				<Grid>
					<Button component={Link} href='/api/routes/auth' variant='contained'>
						Authenticate
					</Button>
				</Grid>
				<Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
					{filteredItems.length ? (
						<Paper sx={{ width: 400 }}>
							<List>
								{filteredItems.map((item) => (
									<ListItem
										key={item.id}
										secondaryAction={
											<IconButton
												onClick={async () => {
													await axios.delete(
														`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${item.id}.json`,
														{
															headers: {
																Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}`,
															},
														},
													);
													router.refresh();
												}}>
												<DeleteIcon color='error' />
											</IconButton>
										}
										disablePadding>
										<ListItemButton component={Link} href={`/api/routes/${item.id}`}>
											<ListItemText>{item.name}</ListItemText>
										</ListItemButton>
									</ListItem>
								))}
							</List>
						</Paper>
					) : (
						<Typography>No Items Found</Typography>
					)}
				</Grid>
			</Grid>
		</Container>
	);
}
