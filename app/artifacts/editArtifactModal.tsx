import type { IArtifact } from '@/src/good';
import ModalDialog from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { useState } from 'react';
import ArtifactForm from './artifactForm';

export default function EditArtifactModal({ artifact }: { artifact: IArtifact }) {
	const dispatch = useAppDispatch();

	const [artifact_, setArtifact_] = useState<IArtifact>(artifact);

	return (
		<ModalDialog
			title='Edit Artifact'
			onSave={() => dispatch(goodActions.editArtifact(artifact_))}>
			<ArtifactForm artifact={artifact_} setArtifact={setArtifact_} />
		</ModalDialog>
	);
}
