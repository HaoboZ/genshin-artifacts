import { useModal, useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { DCharacter } from '@/src/types/data';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { DialogTitle, ModalClose, ModalDialog } from '@mui/joy';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { artifactSetsInfo } from '../artifactData';
import ArtifactModal from '../artifactModal';
import ArtifactForm from './index';

export default function AddArtifactModal(
	{ setKey, file, character }: { setKey: ArtifactSetKey; file?: File; character?: DCharacter },
	ref,
) {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();
	const { closeModal } = useModalControls();

	const initialValues = useMemo<IArtifact>(() => {
		const artifactSet = artifactSetsInfo[setKey];

		return {
			id: nanoid(),
			setKey,
			slotKey: 'flower',
			mainStatKey: 'hp',
			rarity: artifactSet.rarity,
			level: artifactSet.rarity * 4,
			substats: [],
			location: '',
			lock: false,
		};
	}, [setKey]);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Add Artifact{character ? ` to ${character.name}` : ''}</DialogTitle>
			<ModalClose variant='outlined' />
			<Formik<IArtifact>
				initialValues={initialValues}
				onSubmit={(artifact) => {
					if (character) dispatch(goodActions.giveArtifact([character.key, artifact]));
					else dispatch(goodActions.addArtifact(artifact));
					closeModal();
					showModal(ArtifactModal, { props: { artifact } });
				}}>
				<ArtifactForm cropBox={!character} file={file} />
			</Formik>
		</ModalDialog>
	);
}
