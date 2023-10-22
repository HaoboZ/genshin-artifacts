import { useModal, useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, ButtonGroup } from '@mui/joy';
import { charactersInfo } from '../characters/characterData';
import EditArtifactModal from './artifactForm/editArtifactModal';

export default function ArtifactActions({ artifact }: { artifact: IArtifact }) {
	const { showModal } = useModal();
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	if (!artifact) return null;

	return (
		<ButtonGroup>
			<Button
				onClick={() => {
					closeModal();
					showModal(EditArtifactModal, { props: { artifact } });
				}}>
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
						dispatch(goodActions.removeArtifact(artifact));
						closeModal();
					}}>
					Remove
				</Button>
			) : null}
			<Button
				onClick={() => {
					if (!confirm('Delete this artifact?')) return;
					dispatch(goodActions.deleteArtifact(artifact));
					closeModal();
				}}>
				Delete
			</Button>
		</ButtonGroup>
	);
}
