import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { DialogTitle, ModalClose, ModalDialog } from '@mui/joy';
import { Formik } from 'formik';
import { useMemo } from 'react';
import ArtifactForm from './index';

export default function EditArtifactModal({
	artifact,
	cropBox,
}: {
	artifact: IArtifact;
	cropBox?: boolean;
}) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const initialValues = useMemo(() => structuredClone(artifact), [artifact]);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Edit Artifact</DialogTitle>
				<ModalClose variant='outlined' />
				<Formik<IArtifact>
					initialValues={initialValues}
					onSubmit={(artifact) => {
						dispatch(goodActions.editArtifact(artifact));
						closeModal();
					}}>
					<ArtifactForm cropBox={cropBox} />
				</Formik>
			</ModalDialog>
		</ModalWrapper>
	);
}
