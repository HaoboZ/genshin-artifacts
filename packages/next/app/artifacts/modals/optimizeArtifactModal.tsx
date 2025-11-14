import { artifactSlotOrder } from '@/api/artifacts';
import { charactersInfo, useCharacters } from '@/api/characters';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { statArrMatch, weightedPercent } from '@/src/helpers/stats';
import { useModalControls } from '@/src/providers/modal/controls';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IArtifact, ICharacter } from '@/src/types/good';
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
import { filter, groupBy, indexBy, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactStatImage from '../artifactStatImage';

export default function OptimizeArtifactModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(pget('good.artifacts'));
	const characters = useCharacters();

	const [giveArtifacts, setGiveArtifacts] = useState(() => {
		const result: {
			artifact: IArtifact;
			character: Build & ICharacter;
			selected: boolean;
		}[] = [];
		const artifactsClone = structuredClone(artifacts);
		const equippedArtifacts = groupBy<IArtifact>(artifacts, pget('location'));

		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			const characterArtifacts = indexBy(
				equippedArtifacts[character.key] ?? [],
				pget('slotKey'),
			);
			for (const slot of artifactSlotOrder) {
				// skip marked slots
				if (characterArtifacts[slot]?.astralMark) continue;

				const tieredArtifacts = pipe(
					artifactsClone,
					filter(
						({ slotKey, setKey, mainStatKey }) =>
							slotKey === slot &&
							setKey === makeArray(character.artifact[0])[0] &&
							statArrMatch(character.mainStat[slotKey], mainStatKey, true),
					),
					sortBy([(artifact) => weightedPercent(character, artifact), 'desc']),
				);

				for (const artifact of tieredArtifacts) {
					if (artifact.location === character.key) break;
					const currentLocation = characters.findIndex(({ key }) => key === artifact.location);
					// astralMarked artifacts are skipped
					if (artifact.astralMark) continue;
					if (currentLocation !== -1 && currentLocation < i) continue;
					const currentArtifact = artifactsClone.find(
						({ slotKey, location }) => slotKey === slot && location === character.key,
					);
					if (currentArtifact) currentArtifact.location = '';
					artifact.location = character.key;
					result.push({
						artifact: artifacts.find(({ id }) => id === artifact.id),
						character,
						selected: true,
					});
					break;
				}
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
								<ArtifactStatImage
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
								<CharacterImage
									character={charactersInfo[character.key]}
									sx={{ border: character.level ? 0 : 2, borderColor: 'red' }}
								/>
							</ListItemAvatar>
						</ListItem>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						dispatch(goodActions.optimizeArtifacts(giveArtifacts.filter(pget('selected'))));
						closeModal();
					}}>
					Apply
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
