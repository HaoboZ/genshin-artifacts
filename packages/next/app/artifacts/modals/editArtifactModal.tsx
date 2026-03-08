import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type IArtifact } from '@/types/good';
import { DialogTitle } from '@mui/material';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { omit, partition, prop } from 'remeda';
import ArtifactForm from '../artifactForm';

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
	const methods = useForm<IArtifact>({ defaultValues: initialValues });

	return (
		<DialogWrapper>
			<DialogTitle>Edit Artifact</DialogTitle>
			<FormProvider {...methods}>
				<ArtifactForm
					onSubmit={(artifact) => {
						const [unactivatedSubstats, substats] = partition(
							artifact.substats,
							prop('unactivated'),
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
					}}
				/>
			</FormProvider>
		</DialogWrapper>
	);
}
