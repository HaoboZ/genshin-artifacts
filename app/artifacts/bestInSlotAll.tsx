import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { DArtifact, Tier } from '@/src/types/data';
import { Button, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import { filter, pipe, sortBy } from 'remeda';
import { useModal } from '../../src/providers/modal';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetImage from './artifactSetImage';
import OptimalArtifactModal from './optimalArtifactModal';

export default function BestInSlotAll() {
	const priority = useAppSelector(pget('main.priority'));
	const artifacts = useAppSelector(pget('good.artifacts'));
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const { showModal } = useModal();

	const characterFilter = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return (artifactSet: DArtifact) =>
			pipe(
				charactersTier,
				Object.values<Tier>,
				filter(({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key),
				sortBy(({ key }) => {
					const index = priorityIndex.indexOf(key);
					return index === -1 ? Infinity : index;
				}),
			);
	}, [priority]);

	return (
		<Fragment>
			<Button sx={{ mb: 1 }} onClick={() => showModal(OptimalArtifactModal)}>
				Optimize
			</Button>
			{sortBy(Object.values(artifactSetsInfo), ({ order }) => order).map((artifactSet) => {
				const characters = characterFilter(artifactSet);
				const artifactsFiltered = artifacts.filter(({ setKey }) => setKey === artifactSet.key);

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
						{characters.map(({ key }) => (
							<Link key={key} href={`/characters/${key}`}>
								<CharacterImage character={charactersInfo[key]} size={50} />
							</Link>
						))}
						<Typography ml={1}>
							{
								artifactsFiltered.filter(({ location }) =>
									characters.some(({ key }) => location === key),
								).length
							}{' '}
							/{' '}
							{characters.filter((c) => ownedCharacters.some(({ key }) => c.key === key))
								.length * 5}{' '}
							Wanted / {artifactsFiltered.length} Total
						</Typography>
					</Stack>
				);
			})}
		</Fragment>
	);
}
