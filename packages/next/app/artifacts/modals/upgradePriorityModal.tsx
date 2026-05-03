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
import {
	Box,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	List,
	ListItem,
	ListItemText,
	Switch,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { filter, firstBy, groupBy, map, pipe, prop, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactStatCard from '../artifactStatCard';

const EditArtifactModal = dynamicModal(() => import('./editArtifactModal'));

export default function UpgradePriorityModal() {
	const { showModal } = useModal();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const [equippedOnly, setEquippedOnly] = useState(false);

	const artifactsFiltered = useMemo(() => {
		const artifactBuilds = groupBy(buildsList, ({ artifact }) => getFirst(artifact));
		const equippedArtifacts = groupBy(artifacts, prop('location'));

		return pipe(
			artifacts,
			filter(
				({ level, location, rarity }) =>
					level < rarity * 4 && (!equippedOnly || Boolean(location)),
			),
			map((artifact) => ({
				...artifact,
				...pipe(
					(artifactBuilds[artifact.setKey] ?? []) as Build[],
					map((build) => {
						const currentArtifact = equippedArtifacts[build.key]?.find(
							({ slotKey, buildIndex }) => artifact.slotKey === slotKey && !buildIndex,
						);
						const matching = matchingSubStats(build, artifact);

						return {
							build,
							matching,
							maxMatching: matching[0] === 4 || matching[0] >= matching[1],
							potential: potentialPercent(build, artifact),
							currentMatching: matchingSubStats(build, currentArtifact),
							currentPotential: potentialPercent(build, currentArtifact),
						};
					}),
					filter(({ potential }) => Boolean(potential)),
					firstBy(
						[prop('maxMatching'), 'desc'],
						({ potential, currentPotential }) => currentPotential - potential,
					),
				),
			})),
			filter(({ maxMatching, potential }) => maxMatching || potential > 0.25),
			sortBy([prop('maxMatching'), 'desc'], [prop('potential'), 'desc']),
		);
	}, [artifacts, equippedOnly]);

	return (
		<DialogWrapper>
			<DialogTitle>Upgrade Artifact Priority</DialogTitle>
			<DialogContent>
				<FormControlLabel
					control={
						<Switch
							checked={equippedOnly}
							onChange={(_, checked) => setEquippedOnly(checked)}
						/>
					}
					label='Equipped Only'
				/>
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
										<PercentBar p={artifact.currentPotential}>
											Current: %p ({artifact.currentMatching[0]}/
											{artifact.currentMatching[1]})
										</PercentBar>
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
