import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import { Button, ButtonGroup, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import { Fragment } from 'react';
import { sortBy } from 'remeda';
import { charactersInfo } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import useCharactersSorted from '../characters/useCharactersSorted';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetFarmModal from './artifactSetFarmModal';
import ArtifactSetImage from './artifactSetImage';
import OptimalArtifactModal from './optimalArtifactModal';
import UpgradePriorityModal from './upgradePriorityModal';

export default function BestInSlotAll() {
	const characters = useCharactersSorted();
	const artifacts = useAppSelector(pget('good.artifacts'));
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const { showModal } = useModal();

	return (
		<Fragment>
			<ButtonGroup spacing={1} sx={{ mb: 1 }}>
				<Button onClick={() => showModal(OptimalArtifactModal)}>Optimize</Button>
				<Button onClick={() => showModal(UpgradePriorityModal)}>Upgrade</Button>
				<Button onClick={() => showModal(ArtifactSetFarmModal)}>Farm</Button>
			</ButtonGroup>
			{sortBy(Object.values(artifactSetsInfo), ({ order }) => order).map((artifactSet) => {
				const charactersFiltered = characters.filter(
					({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key,
				);
				const artifactsFiltered = artifacts.filter(({ setKey }) => setKey === artifactSet.key);

				const artifactsEquipped = artifactsFiltered.filter(({ location }) =>
					charactersFiltered.some(({ key }) => location === key),
				).length;
				const artifactsWanted =
					charactersFiltered.filter((c) => ownedCharacters.some(({ key }) => c.key === key))
						.length * 5;

				return (
					<Stack key={artifactSet.key} direction='row' alignItems='center'>
						<ArtifactSetImage
							artifactSet={artifactSet}
							size={50}
							sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
							component={Link}
							// @ts-ignore
							href={`/artifacts/${artifactSet.key}`}
						/>
						{charactersFiltered.map(({ key }) => (
							<Link key={key} href={`/characters/${key}`}>
								<CharacterImage character={charactersInfo[key]} size={50} />
							</Link>
						))}
						<Typography ml={1}>
							{artifactsEquipped} / {artifactsWanted} Wanted / {artifactsFiltered.length}{' '}
							Total
						</Typography>
					</Stack>
				);
			})}
		</Fragment>
	);
}
