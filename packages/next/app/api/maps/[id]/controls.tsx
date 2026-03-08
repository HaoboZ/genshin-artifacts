import { type Point } from '@/components/imageRoute/types';
import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Save as SaveIcon, Tune as TuneIcon } from '@mui/icons-material';
import { Paper, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { isDeepEqual } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import { addFile, upsertMap } from '../actions';
import { type MapData, type Text } from '../../routes/types';
import UploadFile from './uploadFile';

const EditMapDataModal = dynamicModal(() => import('../editMapDataModal'));

export default function MapControls({
	mapData,
	text,
	points,
}: {
	mapData: MapData;
	text: Text[];
	points: Point[];
}) {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const { showModal } = useModal();

	const changed = !isDeepEqual(mapData.text, text) || !isDeepEqual(mapData.points, points);

	useWindowEventListener('beforeunload', (e: BeforeUnloadEvent) => {
		if (changed) e.preventDefault();
	});

	async function saveData() {
		await upsertMap({ ...mapData, text, points });
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
					showModal(EditMapDataModal, {
						props: { mapData: { ...mapData, text, points } },
					});
				}}>
				<TuneIcon />
			</AsyncButton>
			<UploadFile
				multiple
				onUpload={async (formData) => {
					await addFile(mapData.id, formData);
					router.refresh();
				}}
			/>
		</Stack>
	);
}
