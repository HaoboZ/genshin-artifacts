'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import PercentBar from '@/components/percentBar';
import makeArray from '@/src/helpers/makeArray';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { Grid, Stack } from '@mui/joy';
import { filter, orderBy } from 'lodash';
import Link from 'next/link';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactModal from './artifactModal';
import ArtifactSetFilter from './artifactSetFilter';
import ArtifactSetImage from './artifactSetImage';
import BestInSlot from './bestInSlot';
import getArtifactTier from './getArtifactTier';

export default function Artifacts() {
	const good = useAppSelector(({ good }) => good);
	const { showModal } = useModal();

	const [artifactSet, setArtifactSet] = useParamState<ArtifactSetKey>('set', null);

	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter artifactSet={artifactSet} setArtifactSet={setArtifactSet} />
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Add',
						onClick: () =>
							showModal(AddArtifactModal, {
								props: { setKey: artifactSet || 'GladiatorsFinale' },
							}),
					},
				]}>
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
								charactersTier,
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
				<PageSection title={artifactSetsInfo[artifactSet].name}>
					<Grid container spacing={1}>
						{orderBy(
							good.artifacts.filter(({ setKey }) => setKey === artifactSet),
							[({ slotKey }) => artifactSlotOrder.indexOf(slotKey), 'level'],
							['asc', 'desc'],
						).map((artifact, index) => {
							const characterTier = charactersTier[artifact.location];
							const { mainStat, subStat } = getArtifactTier(characterTier, artifact);

							return (
								<Grid key={index} xs={6} sm={4} md={3}>
									<ArtifactCard
										artifact={artifact}
										sx={{ ':hover': { cursor: 'pointer' } }}
										onClick={() => showModal(ArtifactModal, { props: { artifact } })}>
										<Grid container xs={12} spacing={0}>
											<Grid xs={6}>
												<PercentBar p={+mainStat}>MainStat: %p</PercentBar>
											</Grid>
											<Grid xs={6}>
												<PercentBar p={subStat}>SubStat: %p</PercentBar>
											</Grid>
										</Grid>
									</ArtifactCard>
								</Grid>
							);
						})}
					</Grid>
				</PageSection>
			)}
		</PageContainer>
	);
}
