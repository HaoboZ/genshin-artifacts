import { type Point } from '@/components/imageRoute/types';
import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Edit as EditIcon, Save as SaveIcon, Tune as TuneIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Fragment } from 'react';
import { isDeepEqual } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import UploadFile from '../../routes/auth/uploadFile';
import { type MapData } from '../../routes/types';

const EditJsonModal = dynamicModal(() => import('../../routes/editJsonModal'));
const MapMetadataModal = dynamicModal(() => import('../mapMetadataModal'));

export default function MapControls({ mapData, points }: { mapData: MapData; points: Point[] }) {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const { showModal } = useModal();

	const changed = !isDeepEqual(points, mapData.points);

	useWindowEventListener('beforeunload', (e: BeforeUnloadEvent) => {
		if (changed) e.preventDefault();
	});

	async function saveData() {
		await axios.post(
			`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}.json`,
			{ ...mapData, points },
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
					<PageBack backButton />
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
						showModal(MapMetadataModal, {
							props: {
								mapData: { ...mapData, points },
								onSaved: () => router.refresh(),
							},
						});
					}}>
					<TuneIcon />
				</AsyncButton>
			</Grid>
			<Grid>
				<AsyncButton
					variant='contained'
					sx={{ minWidth: 'unset' }}
					onClick={() => {
						showModal(EditJsonModal, {
							props: {
								data: mapData,
								onUpload: async (data: any) => {
									await axios.post(
										`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}.json`,
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
				<UploadFile
					multiple
					onUpload={async (formData) => {
						await axios.put(
							`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}.json`,
							formData,
							{ headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` } },
						);
						router.refresh();
					}}
				/>
			</Grid>
		</Fragment>
	);
}
