import { artifactSlotOrder } from '@/api/artifacts';
import { charactersInfo, useCharacters } from '@/api/characters';
import { weightedStatRollPercent } from '@/api/stats';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import statArrMatch from '@/src/helpers/statArrMatch';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IArtifact } from '@/src/types/good';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemContent,
	ModalClose,
	ModalDialog,
} from '@mui/joy';
import { useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactStatImage from '../artifactStatImage';

export default function OptimizeArtifactModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(pget('good.artifacts'));
	const characters = useCharacters({});

	const [giveArtifacts, setGiveArtifacts] = useState(() => {
		const result: { artifact: IArtifact; character: Build; selected: boolean }[] = [];
		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			if (!character.level) continue;
			for (const slot of artifactSlotOrder) {
				const tieredArtifacts = pipe(
					artifacts,
					filter(
						({ slotKey, setKey, mainStatKey }) =>
							slotKey === slot &&
							setKey === makeArray(character.artifact[0])[0] &&
							statArrMatch(character.mainStat[slotKey], mainStatKey, true),
					),
					map((artifact) => ({
						...artifact,
						statRollPercent: weightedStatRollPercent(character, artifact),
					})),
					sortBy(({ statRollPercent }) => -statRollPercent),
				);

				for (const artifact of tieredArtifacts) {
					if (artifact.location === character.key) break;
					const currentLocation = characters.findIndex(({ key }) => key === artifact.location);
					if (currentLocation !== -1 && currentLocation < i) continue;
					const currentArtifact = tieredArtifacts.find(
						({ slotKey, location }) => slotKey === slot && location === character.key,
					);
					if (currentArtifact) currentArtifact.location = '';
					tieredArtifacts.find(({ id }) => id === artifact.id).location = character.key;
					result.push({ artifact, character, selected: true });
					break;
				}
			}
		}
		return result;
	});

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>{'Optimize Artifacts'}</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{giveArtifacts.map(({ artifact, character, selected }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactStatImage
										hideCharacter
										artifact={artifact}
										sx={{
											':hover': { cursor: 'pointer' },
											'border': selected ? '1px solid blue' : undefined,
										}}
										onClick={() =>
											setGiveArtifacts((giveArtifacts) => {
												giveArtifacts[i].selected = !selected;
												return [...giveArtifacts];
											})
										}
									/>
								</ListItemContent>
								<CharacterImage character={charactersInfo[character.key]} />
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							dispatch(
								goodActions.optimizeArtifacts(
									giveArtifacts.filter(({ selected }) => selected),
								),
							);
							closeModal();
						}}>
						Apply
					</Button>
				</DialogActions>
			</ModalDialog>
		</ModalWrapper>
	);
}
