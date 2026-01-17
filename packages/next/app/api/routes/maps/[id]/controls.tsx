import { type Point } from '@/components/imageRoute/types';
import AsyncButton from '@/components/loaders/asyncButton';
import PageBack from '@/components/page/pageBack';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Grid, TextField } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { isDeepEqual } from 'remeda';
import { useKeys, useWindowEventListener } from 'rooks';
import UploadFile from '../../auth/uploadFile';
import { type MapData } from '../../types';

const EditJsonModal = dynamicModal(() => import('../../editJsonModal'));

export default function MapControls({ mapData, points }: { mapData: MapData; points: Point[] }) {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const { showModal } = useModal();

	const [name, setName] = useState(mapData.name ?? '');
	const [spots, setSpots] = useState(mapData.spots ?? 0);

	const changed =
		name !== mapData.name || spots !== mapData.spots || !isDeepEqual(points, mapData.points);

	useWindowEventListener('beforeunload', (e: BeforeUnloadEvent) => {
		if (changed) e.preventDefault();
	});

	async function saveData() {
		await axios.post(
			`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}.json`,
			{ ...mapData, name, spots, points },
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
				<TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} />
			</Grid>
			<Grid>
				<TextField label='Spots' value={spots} onChange={(e) => setSpots(+e.target.value)} />
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
