import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Save as SaveIcon, Tune as TuneIcon } from '@mui/icons-material';
import { Button, Paper, Stack } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { isDeepEqual } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import { upsertRoute } from '../actions';
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
		await upsertRoute({ ...routeData, maps });
		router.refresh();
		enqueueSnackbar('Saved', { variant: 'info' });
	}

	useKeys(['Control', 's'], (e) => {
		e.preventDefault();
		saveData().then();
	});

	return (
		<Stack direction='row' spacing={1} component={Paper} sx={{ p: 1, alignItems: 'center' }}>
			<PageBack backButton />
			<AsyncButton
				variant='contained'
				sx={{ minWidth: 'unset' }}
				disabled={!changed}
				onClick={saveData}>
				<SaveIcon />
			</AsyncButton>
			<AsyncButton
				variant='contained'
				sx={{ minWidth: 'unset' }}
				onClick={() => {
					showModal(EditRouteDataModal, { props: { routeData: { ...routeData, maps } } });
				}}>
				<TuneIcon />
			</AsyncButton>
			<Button component={Link} href={`/farming?route=${routeData.id}`} variant='contained'>
				View
			</Button>
		</Stack>
	);
}
