import { artifactSlotOrder } from '@/api/artifacts';
import { buildsList } from '@/api/builds';
import { charactersInfo, useCharacters } from '@/api/characters';
import getFirst from '@/helpers/getFirst';
import { weightedPercent } from '@/helpers/stats';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type CharacterKey, type IArtifact } from '@/types/good';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { filter, firstBy, groupBy, isNot, map, mapValues, pipe, prop, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactStatCard from '../artifactStatCard';

export default function OptimizeArtifactModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const characters = useCharacters();

	const [giveArtifacts, setGiveArtifacts] = useState(() => {
		const result: {
			artifact: IArtifact;
			character: CharacterKey;
			buildIndex?: number;
			selected: boolean;
		}[] = [];

		const artifactsIndexed = pipe(
			structuredClone(artifacts),
			groupBy<IArtifact>(prop('setKey')),
			mapValues((artifacts) =>
				pipe(
					artifacts,
					groupBy(prop('slotKey')),
					mapValues((artifacts) => sortBy(artifacts, [prop('rarity'), 'desc'])),
				),
			),
		);
		const buildsSorted = sortBy(
			buildsList,
			({ buildIndex }) => buildIndex ?? 0,
			({ key }) => characters.findIndex((character) => character.key === key),
		);

		for (const build of buildsSorted) {
			const setKey = getFirst(build.artifact);
			for (const slotKey of artifactSlotOrder) {
				const filteredArtifacts = artifactsIndexed[setKey]?.[slotKey];
				if (!filteredArtifacts?.length) continue;

				const currentArtifact = filteredArtifacts.find(
					(artifact) =>
						artifact.location === build.key &&
						artifact.slotKey === slotKey &&
						artifact.buildIndex === build.buildIndex,
				);
				if (currentArtifact?.astralMark) continue;

				const { artifact, weight } = pipe(
					filteredArtifacts,
					filter(isNot(prop('astralMark'))),
					map((artifact) => ({ artifact, weight: weightedPercent(build, artifact) })),
					firstBy([prop('weight'), 'desc']),
				);
				if (!weight) continue;

				if (currentArtifact?.id === artifact.id) {
					filteredArtifacts.splice(filteredArtifacts.indexOf(artifact), 1);
					continue;
				}

				if (currentArtifact) currentArtifact.location = '';
				filteredArtifacts.splice(filteredArtifacts.indexOf(artifact), 1);
				artifact.location = build.key;
				result.push({
					artifact: artifacts.find(({ id }) => id === artifact.id),
					character: build.key,
					buildIndex: build.buildIndex,
					selected: true,
				});
			}
		}

		return result;
	});

	return (
		<DialogWrapper>
			<DialogTitle>Optimize Artifacts</DialogTitle>
			<DialogContent>
				<List>
					{giveArtifacts.map(({ artifact, character, selected }, i) => (
						<ListItem key={i} sx={{ pt: 0 }}>
							<ListItemText>
								<ArtifactStatCard
									artifact={artifact}
									sx={{
										':hover': { cursor: 'pointer' },
										'border': 1,
										'borderColor': selected ? 'blue' : 'transparent',
									}}
									onClick={() => {
										setGiveArtifacts((giveArtifacts) => {
											giveArtifacts[i].selected = !selected;
											return [...giveArtifacts];
										});
									}}
								/>
							</ListItemText>
							<ListItemAvatar sx={{ pl: 2 }}>
								<CharacterImage character={charactersInfo[character]} />
							</ListItemAvatar>
						</ListItem>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						dispatch(goodActions.optimizeArtifacts(giveArtifacts.filter(prop('selected'))));
						closeModal();
					}}>
					Apply
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
