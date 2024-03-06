import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import {
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemContent,
	ModalClose,
	ModalDialog,
	Typography,
} from '@mui/joy';
import { useMemo } from 'react';
import { filter, pipe, sortBy } from 'remeda';
import ArtifactCard from './artifactCard';
import EditArtifactModal from './artifactForm/editArtifactModal';
import useArtifactsTiered from './useArtifactsTiered';

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsFiltered = useMemo(
		() => artifacts.filter(({ level, rarity }) => level < rarity * 4),
		[artifacts],
	);
	const artifactsTiered = useArtifactsTiered(artifactsFiltered);
	const artifactsSorted = useMemo(
		() =>
			pipe(
				artifactsTiered,
				filter(({ tier }) => tier.potential > 0.5),
				sortBy(({ tier }) => -tier.potential),
			),
		[artifactsTiered],
	);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Upgrade Artifact Priority</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{artifactsSorted.map((artifact, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactCard
										artifact={artifact}
										sx={{ ':hover': { cursor: 'pointer' } }}
										onClick={() => {
											showModal(EditArtifactModal, { props: { artifact } });
										}}
									/>
								</ListItemContent>
								<Typography>{artifact.tier.potential.toFixed(2)}%</Typography>
							</ListItem>
						))}
					</List>
				</DialogContent>
			</ModalDialog>
		</ModalWrapper>
	);
}
