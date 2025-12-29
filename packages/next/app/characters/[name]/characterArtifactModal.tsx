import { charactersInfo } from '@/api/characters';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import { statArrMatch, weightedPercent } from '@/helpers/stats';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type Build } from '@/types/data';
import { type IArtifact, type SlotKey } from '@/types/good';
import { Box, DialogContent, DialogTitle, FormControlLabel, Grid, Switch } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo, useState } from 'react';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import ArtifactActions from '../../artifacts/artifactActions';
import ArtifactStatCard from '../../artifacts/artifactStatCard';

export default function CharacterArtifactModal({
	build,
	slot,
	artifact,
}: {
	build: Build;
	slot: SlotKey;
	artifact: IArtifact;
}) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(prop('good', 'artifacts'));

	const [checked, setChecked] = useState(true);

	const artifactsSorted = useMemo(() => {
		return pipe(
			artifacts,
			filter(({ slotKey, setKey, mainStatKey }) => {
				if (checked) return slotKey === slot && arrDeepIndex(build.artifact, setKey) === 0;

				return (
					slotKey === slot &&
					arrDeepIndex(build.artifact, setKey) !== -1 &&
					statArrMatch(build.mainStat[slot], mainStatKey)
				);
			}),
			map((artifact) => ({
				...artifact,
				statRollPercent: weightedPercent(build, artifact),
			})),
			sortBy([prop('statRollPercent'), 'desc']),
		);
	}, [build, artifacts, checked, slot]);

	return (
		<DialogWrapper>
			<DialogTitle>
				{capitalCase(slot)} for {charactersInfo[build.key].name}
			</DialogTitle>
			<Box sx={{ px: 3 }}>
				{artifact && (
					<Fragment>
						<ArtifactActions artifact={artifact} />
						<ArtifactStatCard hideCharacter artifact={artifact}>
							<Grid size={12}>
								<PercentBar p={weightedPercent(build, artifact)} />
							</Grid>
						</ArtifactStatCard>
					</Fragment>
				)}
			</Box>
			<DialogContent>
				<FormControlLabel
					control={
						<Switch
							sx={{ ml: 0 }}
							checked={checked}
							onChange={({ target }) => setChecked(target.checked)}
						/>
					}
					label='All in Best Set'
				/>
				<Grid container spacing={1} sx={{ overflowY: 'auto' }}>
					{artifactsSorted.map(({ statRollPercent, ...artifact }, index) => (
						<Grid key={index} size={{ xs: 6, md: 4 }}>
							<ArtifactStatCard
								artifact={artifact}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									if (!confirm(`Give this artifact to ${charactersInfo[build.key].name}?`))
										return;
									dispatch(goodActions.giveArtifact([build.key, artifact]));
									closeModal();
								}}>
								<Grid size={12}>
									<PercentBar p={statRollPercent} />
								</Grid>
							</ArtifactStatCard>
						</Grid>
					))}
				</Grid>
			</DialogContent>
		</DialogWrapper>
	);
}
