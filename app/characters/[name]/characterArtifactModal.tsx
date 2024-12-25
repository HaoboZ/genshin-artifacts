import { charactersInfo } from '@/api/characters';
import { weightedStatRollPercent } from '@/api/stats';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import statArrMatch from '@/src/helpers/statArrMatch';
import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { Box, DialogContent, DialogTitle, FormControlLabel, Grid2, Switch } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo, useState } from 'react';
import { map, pipe, reverse, sortBy } from 'remeda';
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
				statRollPercent: weightedStatRollPercent(build, artifact),
			})),
			sortBy(
				({ setKey }) => -arrDeepIndex(build.artifact, setKey),
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
							<Grid2 size={12}>
								<PercentBar p={weightedStatRollPercent(build, artifact)} />
							</Grid2>
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
				<Grid2 container spacing={1} sx={{ overflowY: 'auto' }}>
					{artifactsSorted.map(({ statRollPercent, ...artifact }, index) => (
						<Grid2 key={index} size={{ xs: 6, md: 4 }}>
							<ArtifactStatImage
								artifact={artifact}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									if (!confirm(`Give this artifact to ${charactersInfo[build.key].name}?`))
										return;
									dispatch(goodActions.giveArtifact([build.key, artifact]));
									closeModal();
								}}>
								<Grid2 size={12}>
									<PercentBar p={statRollPercent} />
								</Grid2>
							</ArtifactStatImage>
						</Grid2>
					))}
				</Grid2>
			</DialogContent>
		</DialogWrapper>
	);
}
