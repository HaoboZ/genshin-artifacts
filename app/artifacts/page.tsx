'use client';
import { artifactSetsInfo } from '@/api/artifacts';
import { charactersInfo, useCharacters } from '@/api/characters';
import PageLink from '@/components/page/link';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { sortBy } from 'remeda';
import CharacterImage from '../characters/characterImage';
import AddArtifactModal from './artifactForm/addArtifactModal';
import BatchAddArtifactModal from './artifactForm/batchAddArtifactModal';
import ArtifactSetImage from './artifactSetImage';
import ArtifactDeleteModal from './modals/artifactDeleteModal';
import ArtifactSetFarmModal from './modals/artifactSetFarmModal';
import OptimizeArtifactModal from './modals/optimizeArtifactModal';
import UpgradePriorityModal from './modals/upgradePriorityModal';

export default function Artifacts() {
	const { showModal } = useModal();
	const characters = useCharacters();
	const artifacts = useAppSelector(pget('good.artifacts'));

	return (
		<PageSection
			title='Best Artifact Set'
			actions={[
				{
					name: 'Add',
					onClick: () => showModal(AddArtifactModal),
				},
				{
					name: 'Batch Add',
					onClick: () => showModal(BatchAddArtifactModal),
				},
			]}>
			<ButtonGroup sx={{ mb: 1 }}>
				<Button onClick={() => showModal(OptimizeArtifactModal)}>Optimize</Button>
				<Button onClick={() => showModal(UpgradePriorityModal)}>Upgrade</Button>
				<Button onClick={() => showModal(ArtifactSetFarmModal)}>Farm</Button>
				<Button onClick={() => showModal(ArtifactDeleteModal)}>Delete</Button>
			</ButtonGroup>
			{sortBy(Object.values(artifactSetsInfo), pget('order')).map((artifactSet) => {
				const charactersFiltered = characters.filter(
					({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key,
				);
				const artifactsFiltered = artifacts.filter(({ setKey }) => setKey === artifactSet.key);
				const artifactsEquipped = artifactsFiltered.filter(({ location }) =>
					charactersFiltered.some(({ key }) => location === key),
				).length;

				return (
					<Stack key={artifactSet.key} direction='row' sx={{ alignItems: 'center' }}>
						<ArtifactSetImage
							artifactSet={artifactSet}
							size={50}
							sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
							component={Link}
							// @ts-ignore
							href={`/artifacts/${artifactSet.key}`}
						/>
						{charactersFiltered.map(({ key, level }) => (
							<PageLink key={key} href={`/characters/${key}`}>
								<CharacterImage
									character={charactersInfo[key]}
									size={50}
									sx={{ border: level ? 0 : 1, borderColor: 'red' }}
								/>
							</PageLink>
						))}
						<Typography sx={{ ml: 1 }}>
							{artifactsEquipped} / {charactersFiltered.length * 5} Wanted /{' '}
							{artifactsFiltered.length} Total
						</Typography>
					</Stack>
				);
			})}
		</PageSection>
	);
}
