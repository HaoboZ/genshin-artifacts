import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { useMemo } from 'react';
import { omit, partition } from 'remeda';
import ArtifactForm from './index';

export default function EditArtifactModal({ artifact }: { artifact: IArtifact }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const initialValues = useMemo(
		() => ({
			...structuredClone(artifact),
			substats: [
				...artifact.substats,
				...(artifact.unactivatedSubstats?.map((substat) => ({
					...substat,
					unactivated: true,
				})) ?? []),
			],
		}),
		[artifact],
	);

	return (
		<DialogWrapper>
			<DialogTitle>Edit Artifact</DialogTitle>
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					const [unactivatedSubstats, substats] = partition(
						artifact.substats,
						(substat) => substat.unactivated,
					);

					dispatch(
						goodActions.editArtifact({
							...artifact,
							substats: substats.map(omit(['unactivated'])),
							unactivatedSubstats: unactivatedSubstats.length
								? unactivatedSubstats.map(omit(['unactivated']))
								: undefined,
						}),
					);
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
