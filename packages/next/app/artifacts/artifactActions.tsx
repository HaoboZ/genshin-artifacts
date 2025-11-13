import { charactersInfo } from '@/api/characters';
import { useModal } from '@/src/providers/modal';
import dynamicModal from '@/src/providers/modal/dynamic';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, ButtonGroup } from '@mui/material';
import { useModalControls } from '../../src/providers/modal/controls';

const EditArtifactModal = dynamicModal(() => import('./artifactForm/editArtifactModal'));

export default function ArtifactActions({ artifact }: { artifact: IArtifact }) {
	const { showModal } = useModal();
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	return (
		<ButtonGroup sx={{ pb: 1 }}>
			<Button onClick={() => showModal(EditArtifactModal, { props: { id: artifact.id } })}>
				Edit
			</Button>
			{artifact.location ? (
				<Button
					onClick={() => {
						if (
							!confirm(
								`Remove this artifact from ${charactersInfo[artifact.location].name}?`,
							)
						)
							return;
						dispatch(goodActions.removeArtifact(artifact.id));
						closeModal();
					}}>
					Remove
				</Button>
			) : null}
			<Button
				onClick={() => {
					if (!confirm('Delete this artifact?')) return;
					dispatch(goodActions.deleteArtifact(artifact.id));
					closeModal();
				}}>
				Delete
			</Button>
		</ButtonGroup>
	);
}
