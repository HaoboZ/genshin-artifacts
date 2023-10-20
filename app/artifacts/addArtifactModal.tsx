import type { ArtifactSetKey, IArtifact } from '@/src/good';
import ModalDialog from '@/src/providers/modal/dialog';
import { data } from '@/src/resources/data';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import ArtifactForm from './artifactForm';

export default function AddArtifactModal({ set }: { set: ArtifactSetKey }) {
	const dispatch = useAppDispatch();

	const [artifact, setArtifact] = useState<IArtifact>(() => {
		const artifactSet = data.artifacts[set];
		return {
			id: nanoid(),
			setKey: set,
			slotKey: 'flower',
			mainStatKey: 'hp',
			rarity: artifactSet.rarity,
			level: artifactSet.rarity * 4,
			substats: [],
			location: '',
			lock: false,
		};
	});

	return (
		<ModalDialog title='Add Artifact' onSave={() => dispatch(goodActions.addArtifact(artifact))}>
			<ArtifactForm artifact={artifact} setArtifact={setArtifact} />
		</ModalDialog>
	);
}
