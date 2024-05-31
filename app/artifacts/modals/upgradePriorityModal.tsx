import { builds } from '@/api/builds';
import { potentialStatRollPercent } from '@/api/stats';
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
import { filter, map, pipe, sortBy } from 'remeda';
import EditArtifactModal from '../artifactForm/editArtifactModal';
import ArtifactStatImage from '../artifactStatImage';
import getArtifactSetBuild from '../getArtifactSetBuild';

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsFiltered = useMemo(
		() =>
			pipe(
				artifacts,
				filter(({ level, rarity }) => level < rarity * 4),
				map((artifact) => ({
					...artifact,
					potential: potentialStatRollPercent(
						artifact.location
							? builds[artifact.location]
							: getArtifactSetBuild(Object.values(builds), artifact.setKey),
						artifact,
					),
				})),
				filter(({ potential }) => potential > 0.4),
				sortBy(({ potential }) => -potential),
			),
		[artifacts],
	);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Upgrade Artifact Priority</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{artifactsFiltered.map((artifact, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactStatImage
										artifact={artifact}
										sx={{ ':hover': { cursor: 'pointer' } }}
										onClick={() => {
											showModal(EditArtifactModal, { props: { artifact } });
										}}
									/>
								</ListItemContent>
								<Typography>{Math.round(artifact.potential * 100)}%</Typography>
							</ListItem>
						))}
					</List>
				</DialogContent>
			</ModalDialog>
		</ModalWrapper>
	);
}
