'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import PercentBar from '@/components/percentBar';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { Grid } from '@mui/joy';
import { compose, sortBy } from 'rambdax';
import { charactersTier } from '../characters/characterData';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactModal from './artifactModal';
import ArtifactSetFilter from './artifactSetFilter';
import BestInSlot from './bestInSlot';
import BestInSlotAll from './bestInSlotAll';
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
					<BestInSlotAll setArtifactSet={setArtifactSet} />
				)}
			</PageSection>
			{artifactSet && (
				<PageSection title={artifactSetsInfo[artifactSet].name}>
					<Grid container spacing={1}>
						{compose(
							sortBy<IArtifact>(({ slotKey }) => artifactSlotOrder.indexOf(slotKey)),
							sortBy<IArtifact>(({ level }) => -level),
						)(good.artifacts.filter(({ setKey }) => setKey === artifactSet)).map(
							(artifact, index) => {
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
							},
						)}
					</Grid>
				</PageSection>
			)}
		</PageContainer>
	);
}
