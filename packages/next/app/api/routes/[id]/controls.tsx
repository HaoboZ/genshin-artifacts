import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Button, Grid, TextField } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { isDeepEqual, omit } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import EditJsonModal from '../editJsonModal';
import { type RouteData } from '../types';

export default function RouteControls({
	routeData,
	maps,
}: {
	routeData: RouteData;
	maps: string[];
}) {
	const router = useRouter();
	const { showModal } = useModal();
	const { enqueueSnackbar } = useSnackbar();

	const [name, setName] = useState(routeData.name ?? '');

	const changed = name !== routeData.name || !isDeepEqual(maps, routeData.maps);

	useWindowEventListener('beforeunload', (e: BeforeUnloadEvent) => {
		if (changed) e.preventDefault();
	});

	async function saveData() {
		await axios.post(
			`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${routeData.id}.json`,
			{ ...routeData, name, maps },
			{ headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` } },
		);
		router.refresh();
		enqueueSnackbar('Saved', { variant: 'info' });
	}

	useKeys(['Control', 's'], (e) => {
		e.preventDefault();
		saveData().then();
	});

	return (
		<Fragment>
			<Grid>
				<Grid>
					<PageBack />
				</Grid>
			</Grid>
			<Grid>
				<AsyncButton
					variant='contained'
					sx={{ minWidth: 'unset' }}
					disabled={!changed}
					onClick={saveData}>
					<SaveIcon />
				</AsyncButton>
			</Grid>
			<Grid>
				<AsyncButton
					variant='contained'
					sx={{ minWidth: 'unset' }}
					onClick={() => {
						showModal(EditJsonModal, {
							props: {
								data: omit(routeData, ['mapsData']),
								onUpload: async (data: any) => {
									await axios.post(
										`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${routeData.id}.json`,
										data,
										{ headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` } },
									);
									router.refresh();
								},
							},
						});
					}}>
					<EditIcon />
				</AsyncButton>
			</Grid>
			<Grid>
				<TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} />
			</Grid>
			<Grid>
				<Button component={Link} href='/api/routes/maps' variant='contained'>
					Add Maps
				</Button>
			</Grid>
			<Grid>
				<Button component={Link} href={`/farming/${routeData.id}`} variant='contained'>
					View
				</Button>
			</Grid>
		</Fragment>
	);
}
