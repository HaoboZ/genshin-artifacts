'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import makeArray from '@/src/helpers/makeArray';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { Grid, Stack } from '@mui/joy';
import { filter, orderBy } from 'lodash';
import Link from 'next/link';
import { charactersInfo } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactModal from './artifactModal';
import ArtifactSetFilter from './artifactSetFilter';
import ArtifactSetImage from './artifactSetImage';
import BestInSlot from './bestInSlot';

export default function Artifacts() {
	const good = useAppSelector(({ good }) => good);
	const { showModal } = useModal();

	const [artifactSet, setArtifactSet] = useParamState<ArtifactSetKey>('set', null);

	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter artifactSet={artifactSet} setArtifactSet={setArtifactSet} />
			<PageSection title='Best in Slot'>
				{artifactSet ? (
					<BestInSlot artifactSet={artifactSet} />
				) : (
					orderBy(artifactSetsInfo, 'order', 'desc').map((artifactSet) => (
						<Stack key={artifactSet.key} direction='row'>
							<ArtifactSetImage
								artifactSet={artifactSet}
								size={50}
								sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
								onClick={() => setArtifactSet(artifactSet.key)}
							/>
							{filter(
								tier,
								({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key,
							).map(({ key }) => (
								<CharacterImage
									key={key}
									character={charactersInfo[key]}
									size={50}
									component={Link}
									// @ts-ignore
									href={`characters/${key}`}
								/>
							))}
						</Stack>
					))
				)}
			</PageSection>
			{artifactSet && (
				<PageSection
					title={artifactSetsInfo[artifactSet].name}
					actions={[
						{
							name: 'Add',
							onClick: () => showModal(AddArtifactModal, { props: { setKey: artifactSet } }),
						},
					]}>
					<Grid container spacing={1}>
						{orderBy(
							good.artifacts.filter(({ setKey }) => setKey === artifactSet),
							[({ slotKey }) => artifactSlotOrder.indexOf(slotKey), 'level'],
							['asc', 'desc'],
						).map((artifact, index) => (
							<Grid key={index} xs={6} sm={4} md={3}>
								<ArtifactCard
									artifact={artifact}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => showModal(ArtifactModal, { props: { artifact } })}
								/>
							</Grid>
						))}
					</Grid>
				</PageSection>
			)}
		</PageContainer>
	);
}
