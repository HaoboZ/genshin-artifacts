import { artifactSetsInfo } from '@/api/artifacts';
import { useModal } from '@/providers/modal';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import dynamicModal from '@/providers/modal/dynamicModal';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type IArtifact } from '@/types/good';
import { DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { omit, partition, prop } from 'remeda';
import ArtifactForm from './index';

const ArtifactModal = dynamicModal(() => import('../artifactModal'));

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
			astralMark: false,
		};
	}, []);

	return (
		<DialogWrapper>
			<DialogTitle>Add Artifact</DialogTitle>
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					const [unactivatedSubstats, substats] = partition(
						artifact.substats,
						prop('unactivated'),
					);
					dispatch(
						goodActions.addArtifact({
							...artifact,
							substats: substats.map(omit(['unactivated'])),
							unactivatedSubstats: unactivatedSubstats?.map(omit(['unactivated'])),
						}),
					);
					closeModal();
					showModal(ArtifactModal, { props: { artifact } });
				}}>
				<ArtifactForm />
			</Formik>
		</DialogWrapper>
	);
}
