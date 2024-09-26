import { charactersInfo } from '@/api/characters';
import { useModal, useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Button, ButtonGroup } from '@mui/material';
import EditArtifactModal from './artifactForm/editArtifactModal';

export default function ArtifactActions({
	artifact,
	cropBox,
}: {
	artifact: IArtifact;
	cropBox?: boolean;
}) {
	const { showModal } = useModal();
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	return (
		<ButtonGroup sx={{ pb: 1 }}>
			<Button
				onClick={() => {
					closeModal();
					showModal(EditArtifactModal, { props: { artifact, cropBox } });
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
