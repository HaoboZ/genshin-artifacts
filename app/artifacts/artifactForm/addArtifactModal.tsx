import { artifactSetsInfo } from '@/api/artifacts';
import { useModal, useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { DCharacter } from '@/src/types/data';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import ArtifactModal from '../[artifactSet]/artifactModal';
import ArtifactForm from './index';

export default function AddArtifactModal({
	setKey = 'GladiatorsFinale',
	file,
	character,
}: {
	setKey?: ArtifactSetKey;
	file?: File;
	character?: DCharacter;
}) {
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
		<DialogWrapper>
			<DialogTitle>Add Artifact{character ? ` to ${character.name}` : ''}</DialogTitle>
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
		</DialogWrapper>
	);
}
