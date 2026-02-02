import { buildsList } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import PageLink from '@/components/page/pageLink';
import PercentBar from '@/components/stats/percentBar';
import getFirst from '@/helpers/getFirst';
import { matchingSubStats, potentialPercent } from '@/helpers/stats';
import { useModal } from '@/providers/modal';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import dynamicModal from '@/providers/modal/dynamicModal';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppSelector } from '@/store/hooks';
import { type Build } from '@/types/data';
import { Box, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import { useMemo } from 'react';
import { filter, groupBy, map, pipe, prop, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactStatCard from '../artifactStatCard';

const EditArtifactModal = dynamicModal(() => import('../artifactForm/editArtifactModal'));

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(prop('good', 'artifacts'));

	const artifactsFiltered = useMemo(() => {
		const artifactBuilds = groupBy(buildsList, ({ artifact }) => getFirst(artifact));
		const equippedArtifacts = groupBy(artifacts, prop('location'));

		return pipe(
			artifacts,
			filter(({ level, rarity }) => level < rarity * 4),
			map((artifact) => ({
				...artifact,
				...sortBy(
					pipe(
						(artifactBuilds[artifact.setKey] ?? []) as Build[],
						map((build) => {
							const matching = matchingSubStats(build, artifact);

							return {
								build,
								matching,
								maxMatching: matching[0] === 4 || matching[0] >= matching[1],
								potential: potentialPercent(build, artifact),
								currentPotential: potentialPercent(
									build,
									equippedArtifacts[build.key]?.find(
										({ slotKey, buildIndex }) =>
											artifact.slotKey === slotKey && !buildIndex,
									),
								),
							};
						}),
						filter(({ potential }) => Boolean(potential)),
					),
					[prop('maxMatching'), 'desc'],
					({ potential, currentPotential }) => {
						if (currentPotential < potential) return (currentPotential - potential) * 10;
						return potential > 0.5 ? -potential : currentPotential - potential;
					},
				)[0],
			})),
			filter(({ maxMatching, potential }) => maxMatching || potential > 0.25),
			sortBy([prop('maxMatching'), 'desc'], [prop('potential'), 'desc']),
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
								<ArtifactStatCard
									artifact={artifact}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => {
										showModal(EditArtifactModal, { props: { id: artifact.id } });
									}}
								/>
								<PercentBar p={artifact.potential}>
									Potential: %p ({artifact.matching[0]}/{artifact.matching[1]})
								</PercentBar>
							</ListItemText>
							{artifact.build.key !== artifact.location && (
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
