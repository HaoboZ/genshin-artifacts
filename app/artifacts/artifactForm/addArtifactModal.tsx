import { artifactSetsInfo } from '@/api/artifacts';
import { useModal, useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import ArtifactModal from '../[artifactSet]/artifactModal';
import ArtifactForm from './index';

export default function AddArtifactModal() {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();
	const { closeModal } = useModalControls();

	const initialValues = useMemo<IArtifact>(() => {
		const { rarity } = artifactSetsInfo.GladiatorsFinale;

		return {
			id: nanoid(),
			setKey: 'GladiatorsFinale',
			slotKey: 'flower',
			mainStatKey: 'hp',
			rarity,
			level: rarity * 4,
			substats: [],
			location: '',
			lock: false,
		};
	}, []);

	return (
		<DialogWrapper>
			<DialogTitle>Add Artifact</DialogTitle>
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					dispatch(goodActions.addArtifact(artifact));
					closeModal();
					showModal(ArtifactModal, { props: { artifact } });
				}}>
				<ArtifactForm />
			</Formik>
		</DialogWrapper>
	);
}
