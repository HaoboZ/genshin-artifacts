import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { DialogTitle, ModalDialog } from '@mui/joy';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { artifactSetsInfo } from '../artifactData';
import ArtifactForm from './index';

export default function AddArtifactModal({ setKey }: { setKey: ArtifactSetKey }, ref) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const artifactSet = artifactSetsInfo[setKey];

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Add Artifact</DialogTitle>
			<Formik<IArtifact>
				initialValues={{
					id: nanoid(),
					setKey,
					slotKey: 'flower',
					mainStatKey: 'hp',
					rarity: artifactSet.rarity,
					level: artifactSet.rarity * 4,
					substats: [],
					location: '',
					lock: false,
				}}
				onSubmit={(artifact) => {
					dispatch(goodActions.addArtifact(artifact));
					closeModal();
				}}>
				<ArtifactForm />
			</Formik>
		</ModalDialog>
	);
}
