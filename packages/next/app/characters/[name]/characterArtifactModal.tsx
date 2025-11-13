import { charactersInfo } from '@/api/characters';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { statArrMatch, weightedPercent } from '@/src/helpers/stats';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { Box, DialogContent, DialogTitle, FormControlLabel, Grid, Switch } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo, useState } from 'react';
import { map, pipe, reverse, sortBy } from 'remeda';
import { useModalControls } from '../../../src/providers/modal/controls';
import ArtifactActions from '../../artifacts/artifactActions';
import ArtifactStatImage from '../../artifacts/artifactStatImage';

export default function CharacterArtifactModal({
	build,
	slot,
	artifact,
}: {
	build: Build;
	slot: SlotKey;
	artifact: IArtifact;
}) {
	const artifacts = useAppSelector(pget('good.artifacts'));
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(true);

	const artifactsSorted = useMemo(() => {
		const mainStat = build.mainStat[slot] && makeArray(build.mainStat[slot]);

		const artifactsFiltered = artifacts.filter(({ slotKey, setKey, mainStatKey }) => {
			if (checked) return slotKey === slot && arrDeepIndex(build.artifact, setKey) === 0;

			return (
				slotKey === slot &&
				arrDeepIndex(build.artifact, setKey) !== -1 &&
				statArrMatch(mainStat, mainStatKey)
			);
		});

		return pipe(
			artifactsFiltered,
			map((artifact) => ({
				...artifact,
				statRollPercent: weightedPercent(build, artifact),
			})),
			sortBy(
				[({ setKey }) => arrDeepIndex(build.artifact, setKey), 'desc'],
				pget('statRollPercent'),
				pget('artifact.level'),
			),
			reverse(),
		);
	}, [artifacts, checked, slot, build]);

	return (
		<DialogWrapper>
			<DialogTitle>
				{capitalCase(slot)} for {charactersInfo[build.key].name}
			</DialogTitle>
			<Box sx={{ px: 3 }}>
				{artifact && (
					<Fragment>
						<ArtifactActions artifact={artifact} />
						<ArtifactStatImage hideCharacter artifact={artifact}>
							<Grid size={12}>
								<PercentBar p={weightedPercent(build, artifact)} />
							</Grid>
						</ArtifactStatImage>
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
							<ArtifactStatImage
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
							</ArtifactStatImage>
						</Grid>
					))}
				</Grid>
			</DialogContent>
		</DialogWrapper>
	);
}
