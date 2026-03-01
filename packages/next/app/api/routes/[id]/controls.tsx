import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Save as SaveIcon, Tune as TuneIcon } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Fragment } from 'react';
import { isDeepEqual } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import { type RouteData } from '../types';

const EditRouteDataModal = dynamicModal(() => import('../editRouteDataModal'));

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

	const changed = !isDeepEqual(maps, routeData.maps);

	useWindowEventListener('beforeunload', (e: BeforeUnloadEvent) => {
		if (changed) e.preventDefault();
	});

	async function saveData() {
		await axios.post(
			`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${routeData.id}`,
			{ ...routeData, maps },
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
				<PageBack />
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
						showModal(EditRouteDataModal, { props: { routeData: { ...routeData, maps } } });
					}}>
					<TuneIcon />
				</AsyncButton>
			</Grid>
			<Grid>
				<Button component={Link} href={`/farming?route=${routeData.id}`} variant='contained'>
					View
				</Button>
			</Grid>
		</Fragment>
	);
}
