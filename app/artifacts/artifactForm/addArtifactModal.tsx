import { useModal, useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { DialogTitle, ModalClose, ModalDialog } from '@mui/joy';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { artifactSetsInfo } from '../artifactData';
import ArtifactModal from '../artifactModal';
import ArtifactForm from './index';

export default function AddArtifactModal({ setKey }: { setKey: ArtifactSetKey }, ref) {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();
	const { closeModal } = useModalControls();

	const artifactSet = artifactSetsInfo[setKey];

	const initialValues = useMemo<IArtifact>(
		() => ({
			id: nanoid(),
			setKey,
			slotKey: 'flower',
			mainStatKey: 'hp',
			rarity: artifactSet.rarity,
			level: artifactSet.rarity * 4,
			substats: [],
			location: '',
			lock: false,
		}),
		[],
	);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Add Artifact</DialogTitle>
			<ModalClose variant='outlined' />
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					dispatch(goodActions.addArtifact(artifact));
					closeModal();
					showModal(ArtifactModal, { props: { artifact } });
				}}>
				<ArtifactForm />
			</Formik>
		</ModalDialog>
	);
}
