import PageSection from '@/components/page/section';
import PercentBar from '@/components/percentBar';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import { Button, FormControl, FormLabel, Grid, Switch, Typography } from '@mui/joy';
import { useMemo, useState } from 'react';
import { pipe, sortBy } from 'remeda';
import ArtifactCard from '../artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from '../artifactData';
import ArtifactModal from '../artifactModal';
import OptimalArtifactModal from '../optimalArtifactModal';
import useArtifactsTiered from '../useArtifactsTiered';

export default function ArtifactList({
	artifactSet,
	slot,
}: {
	artifactSet: ArtifactSetKey;
	slot: SlotKey;
}) {
	const artifacts = useAppSelector(pget('good.artifacts'));
	const filteredArtifacts = useMemo(
		() =>
			artifacts.filter(
				({ setKey, slotKey }) => setKey === artifactSet && (!slot || slot === slotKey),
			),
		[artifacts],
	);
	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const [deleteMode, setDeleteMode] = useState(false);
	const [marked, setMarked] = useState([]);

	const artifactsTiered = useArtifactsTiered(filteredArtifacts);
	const artifactsSorted = useMemo(
		() =>
			pipe(
				artifactsTiered,
				sortBy(
					({ tier }) => -tier.potential,
					({ slotKey }) => artifactSlotOrder.indexOf(slotKey),
				),
			),
		[artifactSet, slot],
	);

	return (
		<PageSection
			title={artifactSetsInfo[artifactSet].name}
			actions={
				<FormControl orientation='horizontal'>
					<FormLabel>Delete Mode</FormLabel>
					<Switch
						size='lg'
						sx={{ ml: 0 }}
						checked={deleteMode}
						onChange={({ target }) => {
							setDeleteMode(target.checked);
							setMarked([]);
						}}
					/>
					{marked.length > 0 ? (
						<Button
							sx={{ ml: 1 }}
							onClick={() => {
								if (!confirm(`Delete ${marked.length} artifacts?`)) return;
								dispatch(goodActions.deleteArtifacts(marked));
								setMarked([]);
							}}>
							Delete
						</Button>
					) : (
						<Button
							sx={{ ml: 1 }}
							onClick={() => showModal(OptimalArtifactModal, { props: { artifactSet } })}>
							Optimize
						</Button>
					)}
				</FormControl>
			}>
			<Typography>
				Great:{' '}
				{
					artifactsSorted.filter(
						({ tier }) => tier.mainStat && tier.rarity && tier.subStat > 0.6,
					).length
				}{' '}
				/ Good:{' '}
				{artifactsSorted.filter(({ location, tier }) => location && tier.mainStat).length}
			</Typography>
			<Grid container spacing={1}>
				{artifactsSorted.map(({ tier, ...artifact }, index) => {
					const isMarked = marked.indexOf(artifact) !== -1;

					return (
						<Grid key={index} xs={6} sm={4} md={3}>
							<ArtifactCard
								artifact={artifact}
								sx={{
									':hover': { cursor: 'pointer' },
									'borderColor': () => {
										if (isMarked) return 'red';
										if (artifact.location && tier.mainStat) {
											if (tier.rarity && tier.subStat > 0.6) return 'green';
											return 'blue';
										}
									},
								}}
								onClick={() => {
									if (deleteMode) {
										setMarked((marked) =>
											isMarked
												? marked.filter((item) => item !== artifact)
												: [...marked, artifact],
										);
									} else {
										showModal(ArtifactModal, { props: { artifact } });
									}
								}}>
								<Grid container xs={12} spacing={0}>
									<Grid xs={6}>
										<PercentBar p={tier.mainStat && tier.subStat}>Stats: %p</PercentBar>
									</Grid>
									<Grid xs={6}>
										<PercentBar p={tier.mainStat && tier.potential}>
											Potential: %p
										</PercentBar>
									</Grid>
								</Grid>
							</ArtifactCard>
						</Grid>
					);
				})}
			</Grid>
		</PageSection>
	);
}
