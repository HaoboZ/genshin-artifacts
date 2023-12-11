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
import { useMemo } from 'react';
import { filter, map, pipe, reverse, sortBy } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import getArtifactTier from './getArtifactTier';

export default function OptimalArtifactModal({ artifactSet }: { artifactSet?: ArtifactSetKey }) {
	const dispatch = useAppDispatch();
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const storedArtifacts = useAppSelector(pget('good.artifacts'));
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const givenArtifacts = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		const characters = pipe(
			charactersTier,
			Object.values<Tier>,
			filter(
				({ key, artifact }) =>
					ownedCharacters.findIndex((c) => key === c.key) !== -1 &&
					(artifactSet ? makeArray(artifact[0])[0] === artifactSet : true),
			),
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);

		const artifacts = structuredClone(
			artifactSet
				? storedArtifacts.filter(({ setKey }) => setKey === artifactSet)
				: storedArtifacts,
		);
		const result: { artifact: IArtifact; character: Tier }[] = [];
		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			for (const slot of artifactSlotOrder) {
				const tieredArtifacts = pipe(
					artifacts,
					filter(
						({ slotKey, setKey }) =>
							slotKey === slot && setKey === makeArray(character.artifact[0])[0],
					),
					map((artifact) => ({ artifact, tier: getArtifactTier(character, artifact) })),
					filter(({ artifact }) =>
						strArrMatch(character.mainStat[artifact.slotKey], artifact.mainStatKey, true),
					),
					sortBy(({ tier }) => +tier.rarity * 0.5 + tier.subStat * 0.5),
					reverse(),
				);

				for (const { artifact } of tieredArtifacts) {
					if (artifact.location === character.key) break;
					const currentLocation = characters.findIndex(({ key }) => key === artifact.location);
					if (currentLocation !== -1 && currentLocation < i) continue;

					const currentArtifact = artifacts.find(
						({ slotKey, location }) => slotKey === slot && location === character.key,
					);
					if (currentArtifact) currentArtifact.location = '';
					artifact.location = character.key;
					result.push({ artifact, character });
					break;
				}
			}
		}
		return result;
	}, []);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>
					{artifactSet ? artifactSetsInfo[artifactSet].name : 'All Artifacts'}
				</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{givenArtifacts.map(({ artifact, character }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactCard hideCharacter artifact={artifact} />
								</ListItemContent>
								<CharacterImage character={charactersInfo[character.key]} />
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							dispatch(goodActions.optimizeArtifacts(givenArtifacts));
							closeModal();
						}}>
						Apply All
					</Button>
				</DialogActions>
			</ModalDialog>
		</ModalWrapper>
	);
}
