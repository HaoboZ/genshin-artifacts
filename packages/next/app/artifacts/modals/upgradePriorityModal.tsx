import { missingArtifactSets } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { potentialPercent } from '@/api/stats';
import PageLink from '@/components/page/link';
import PercentBar from '@/components/percentBar';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useModal, useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import { Box, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import { useMemo } from 'react';
import { filter, groupBy, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import EditArtifactModal from '../artifactForm/editArtifactModal';
import ArtifactStatImage from '../artifactStatImage';

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsFiltered = useMemo(() => {
		const artifactBuilds = groupBy(
			[...Object.values(builds), ...Object.values(missingArtifactSets)],
			({ artifact }) => makeArray(artifact[0])[0],
		);
		const equippedArtifacts = groupBy(artifacts, pget('location'));

		return pipe(
			artifacts,
			filter(({ level, rarity }) => level < rarity * 4),
			map((artifact) => ({
				...artifact,
				...sortBy(
					artifactBuilds[artifact.setKey].map((build) => ({
						build,
						potential: potentialPercent(build, artifact),
						currentPotential: potentialPercent(
							build,
							equippedArtifacts[build.key]?.find(
								({ slotKey }) => artifact.slotKey === slotKey,
							),
						),
					})),
					({ potential, currentPotential }) =>
						potential > 0.5 ? -potential : currentPotential - potential,
				)[0],
			})),
			filter(({ potential }) => potential > 0.25),
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
							{artifact.build?.weapon.length !== 0 &&
								artifact.build.key !== artifact.location && (
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
