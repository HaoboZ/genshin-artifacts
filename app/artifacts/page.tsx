'use client';
import { artifactSetsInfo } from '@/api/artifacts';
import { charactersInfo, useCharacters } from '@/api/characters';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import useClipboardImage from '@/src/hooks/useClipboardImage';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import { Button, ButtonGroup, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import { sortBy } from 'remeda';
import CharacterImage from '../characters/characterImage';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactSetImage from './artifactSetImage';
import ArtifactDeleteModal from './modals/artifactDeleteModal';
import ArtifactSetFarmModal from './modals/artifactSetFarmModal';
import OptimizeArtifactModal from './modals/optimizeArtifactModal';
import UpgradePriorityModal from './modals/upgradePriorityModal';

export default function Artifacts() {
	const { modalStates, showModal } = useModal();
	const characters = useCharacters({});
	const artifacts = useAppSelector(pget('good.artifacts'));

	useClipboardImage((items) => {
		if (modalStates.length) return;
		showModal(AddArtifactModal, { props: { file: items[0].getAsFile() } });
	});

	return (
		<PageSection
			title='Best in Slot'
			actions={[
				{
					name: 'Paste or Add',
					onClick: () => showModal(AddArtifactModal),
				},
			]}>
			<ButtonGroup spacing={1} sx={{ mb: 1 }}>
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
							{artifactsEquipped} / {charactersFiltered.length * 5} Wanted /{' '}
							{artifactsFiltered.length} Total
						</Typography>
					</Stack>
				);
			})}
		</PageSection>
	);
}
