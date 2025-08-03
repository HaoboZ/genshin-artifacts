import { missingArtifactSets } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { maxPotentialBuild, potentialPercent } from '@/api/stats';
import PageLink from '@/components/page/link';
import PercentBar from '@/components/percentBar';
import pget from '@/src/helpers/pget';
import { useModal, useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import { Box, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import EditArtifactModal from '../artifactForm/editArtifactModal';
import ArtifactStatImage from '../artifactStatImage';

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsFiltered = useMemo(() => {
		return pipe(
			artifacts,
			filter(({ level, rarity }) => level < rarity * 4),
			map((artifact) => ({
				...artifact,
				...maxPotentialBuild(
					[...Object.values(builds), ...Object.values(missingArtifactSets)],
					artifact,
				),
			})),
			filter(({ potential }) => potential > 0.25),
			map((artifact) => ({
				...artifact,
				currentPotential: potentialPercent(
					artifact.build,
					artifacts.find(
						({ location, slotKey }) =>
							artifact.build?.key === location && artifact.slotKey === slotKey,
					),
				),
			})),
			sortBy([pget('potential'), 'desc']),
		);
	}, [artifacts]);

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
								<PercentBar p={artifact.potential}>Potential: %p</PercentBar>
							</ListItemText>
							{artifact.build && artifact.build.key !== artifact.location && (
								<Box sx={{ ml: 1 }}>
									<PageLink
										href={`/characters/${artifact.build.key}`}
										onClick={() => closeModal()}>
										<CharacterImage character={charactersInfo[artifact.build.key]} />
										<PercentBar p={artifact.currentPotential}>Current: %p</PercentBar>
									</PageLink>
								</Box>
							)}
						</ListItem>
					))}
				</List>
			</DialogContent>
		</DialogWrapper>
	);
}
