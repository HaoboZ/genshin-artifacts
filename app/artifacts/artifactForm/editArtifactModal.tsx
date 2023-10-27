import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { DialogTitle, ModalClose, ModalDialog } from '@mui/joy';
import { Formik } from 'formik';
import { useMemo } from 'react';
import ArtifactForm from './index';

export default function EditArtifactModal({ artifact }: { artifact: IArtifact }, ref) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const initialValues = useMemo(() => structuredClone(artifact), [artifact]);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Edit Artifact</DialogTitle>
			<ModalClose variant='outlined' />
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					dispatch(goodActions.editArtifact(artifact));
					closeModal();
				}}>
				<ArtifactForm />
			</Formik>
		</ModalDialog>
	);
}
