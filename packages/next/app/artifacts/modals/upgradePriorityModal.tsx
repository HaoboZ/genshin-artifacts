import { builds } from '@/api/builds';
import { potentialStatRollPercent, potentialStatRollPercents } from '@/api/stats';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import {
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import EditArtifactModal from '../artifactForm/editArtifactModal';
import ArtifactStatImage from '../artifactStatImage';

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
					potential: artifact.location
						? potentialStatRollPercent(builds[artifact.location], artifact)
						: Math.max(...potentialStatRollPercents(Object.values(builds), artifact)),
				})),
				filter(({ potential }) => potential > 0.4),
				sortBy([pget('potential'), 'desc']),
			),
		[artifacts],
	);

	return (
		<DialogWrapper>
			<DialogTitle>Upgrade Artifact Priority</DialogTitle>
			<DialogContent>
				<List>
					{artifactsFiltered.map((artifact, i) => (
						<ListItem key={i}>
							<ListItemText>
								<ArtifactStatImage
									artifact={artifact}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => {
										showModal(EditArtifactModal, { props: { artifact } });
									}}
								/>
							</ListItemText>
							<Typography sx={{ pl: 2 }}>{Math.round(artifact.potential * 100)}%</Typography>
						</ListItem>
					))}
				</List>
			</DialogContent>
		</DialogWrapper>
	);
}
