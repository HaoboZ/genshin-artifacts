import PageSection from '@/components/page/section';
import PercentBar from '@/components/percentBar';
import { useModal } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { ArtifactSetKey, IArtifact } from '@/src/types/good';
import { Button, FormControl, FormLabel, Grid, Switch } from '@mui/joy';
import { compose, sortBy } from 'rambdax';
import { useState } from 'react';
import { charactersTier } from '../characters/characterData';
import ArtifactCard from './artifactCard';
import { artifactSetsInfo, artifactSlotOrder } from './artifactData';
import ArtifactModal from './artifactModal';
import getArtifactTier from './getArtifactTier';

export default function ArtifactList({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const good = useAppSelector(({ good }) => good);
	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const [deleteMode, setDeleteMode] = useState(false);
	const [marked, setMarked] = useState([]);

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
						onChange={({ target }) => setDeleteMode(target.checked)}
					/>
					{marked.length > 0 && (
						<Button
							sx={{ ml: 1 }}
							onClick={() => {
								if (!confirm(`Delete ${marked.length} artifacts?`)) return;
								dispatch(goodActions.deleteArtifacts(marked));
							}}>
							Delete
						</Button>
					)}
				</FormControl>
			}>
			<Grid container spacing={1}>
				{compose(
					sortBy<IArtifact>(({ slotKey }) => artifactSlotOrder.indexOf(slotKey)),
					sortBy<IArtifact>(({ level }) => -level),
				)(good.artifacts.filter(({ setKey }) => setKey === artifactSet)).map(
					(artifact, index) => {
						const characterTier = charactersTier[artifact.location];
						const { mainStat, subStat } = getArtifactTier(characterTier, artifact);
						const isMarked = marked.indexOf(artifact) !== -1;

						return (
							<Grid key={index} xs={6} sm={4} md={3}>
								<ArtifactCard
									artifact={artifact}
									sx={{
										':hover': { cursor: 'pointer' },
										'borderColor': isMarked ? 'red' : undefined,
									}}
									onClick={() => {
										if (deleteMode)
											setMarked((marked) => {
												return isMarked
													? marked.filter((item) => item !== artifact)
													: [...marked, artifact];
											});
										else showModal(ArtifactModal, { props: { artifact } });
									}}>
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
	);
}
