import { useModalControls } from '@/src/providers/modal/controls';
import DialogWrapper from '@/src/providers/modal/dialog';
import { store } from '@/src/store';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { useMemo } from 'react';
import { omit, partition } from 'remeda';
import ArtifactForm from './index';

export default function EditArtifactModal({ id }: { id: string }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const initialValues = useMemo(() => {
		const artifact = store.getState().good.artifacts.find((artifact) => artifact.id === id);
		return {
			...structuredClone(artifact),
			substats: [
				...artifact.substats,
				...(artifact.unactivatedSubstats?.map((substat) => ({
					...substat,
					unactivated: true,
				})) ?? []),
			],
		};
	}, [id]);

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
								dispatch(goodActions.deleteArtifact(id));
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
