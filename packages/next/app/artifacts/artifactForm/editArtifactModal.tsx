import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { useMemo } from 'react';
import ArtifactForm from './index';

export default function EditArtifactModal({ artifact }: { artifact: IArtifact }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const initialValues = useMemo(() => structuredClone(artifact), [artifact]);

	return (
		<DialogWrapper>
			<DialogTitle>Edit Artifact</DialogTitle>
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					dispatch(goodActions.editArtifact(artifact));
					closeModal();
				}}>
				<ArtifactForm
					deleteButton={
						<Button
							variant='contained'
							color='error'
							onClick={() => {
								if (!confirm('Delete this artifact?')) return;
								dispatch(goodActions.deleteArtifact(artifact));
								closeModal();
							}}>
							Delete
						</Button>
					}
				/>
			</Formik>
		</DialogWrapper>
	);
}
