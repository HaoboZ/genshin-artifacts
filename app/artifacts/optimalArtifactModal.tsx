import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import strArrMatch from '@/src/helpers/strArrMatch';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
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
import { useMemo, useState } from 'react';
import { filter, pipe, reverse, sortBy } from 'remeda';
import { charactersInfo } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import useCharactersSorted from '../characters/useCharactersSorted';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import useArtifactsTiered from './useArtifactsTiered';

export default function OptimalArtifactModal({ artifactSet }: { artifactSet?: ArtifactSetKey }) {
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(pget('good.artifacts'));
	const characters = useCharactersSorted();
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const { closeModal } = useModalControls();

	const charactersFiltered = useMemo(
		() =>
			characters.filter(
				({ key, artifact }) =>
					ownedCharacters.findIndex((c) => key === c.key) !== -1 &&
					(artifactSet ? makeArray(artifact[0])[0] === artifactSet : true),
			),
		[characters, artifactSet],
	);

	const artifactsFiltered = useMemo(
		() =>
			structuredClone(
				artifactSet ? artifacts.filter(({ setKey }) => setKey === artifactSet) : artifacts,
			),
		[artifactSet, artifacts],
	);

	const artifactsTiered = useArtifactsTiered(artifactsFiltered);

	const [giveArtifacts, setGiveArtifacts] = useState(() => {
		const result: { artifact: IArtifact; character: Tier; selected: boolean }[] = [];
		for (let i = 0; i < charactersFiltered.length; i++) {
			const character = charactersFiltered[i];
			for (const slot of artifactSlotOrder) {
				const tieredArtifacts = pipe(
					artifactsTiered,
					filter(
						({ slotKey, setKey, mainStatKey }) =>
							slotKey === slot &&
							setKey === makeArray(character.artifact[0])[0] &&
							strArrMatch(character.mainStat[slotKey], mainStatKey, true),
					),
					sortBy(({ tier }) => +tier.rarity * 0.5 + tier.subStat * 0.5),
					reverse(),
				);

				for (const artifact of tieredArtifacts) {
					if (artifact.location === character.key) break;
					const currentLocation = charactersFiltered.findIndex(
						({ key }) => key === artifact.location,
					);
					if (currentLocation !== -1 && currentLocation < i) continue;

					const currentArtifact = artifactsTiered.find(
						({ slotKey, location }) => slotKey === slot && location === character.key,
					);
					if (currentArtifact) currentArtifact.location = '';
					artifact.location = character.key;
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
				<DialogTitle>
					{artifactSet ? artifactSetsInfo[artifactSet].name : 'All Artifacts'}
				</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{giveArtifacts.map(({ artifact, character, selected }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactCard
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
