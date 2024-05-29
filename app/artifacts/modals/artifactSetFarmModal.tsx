import { artifactSetsInfo } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { potentialStatRollPercent, statName } from '@/api/stats';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import type { StatKey } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid, ModalClose, ModalDialog, Typography } from '@mui/joy';
import { capitalCase } from 'change-case';
import { Fragment, useMemo } from 'react';
import { filter, groupBy, map, mapValues, pipe, sortBy, toPairs, unique } from 'remeda';
import ArtifactSetImage from '../artifactSetImage';

export default function ArtifactSetFarmModal() {
	const artifacts = useAppSelector(pget('good.artifacts'));

	const { missingMainStat, lowPotential } = useMemo(() => {
		const artifactSetPriority = pipe(
			artifacts,
			filter(pget('location') as any),
			map((artifact) => ({
				...artifact,
				mainStatMatch:
					artifact.slotKey !== 'flower' &&
					artifact.slotKey !== 'plume' &&
					makeArray(builds[artifact.location].mainStat[artifact.slotKey])[0] !==
						artifact.mainStatKey,
				potential: potentialStatRollPercent(builds[artifact.location], artifact),
			})),
			groupBy(pget('setKey')),
			mapValues((artifacts) => ({
				mainStats: artifacts
					.filter(pget('mainStatMatch'))
					.reduce((mismatch, { slotKey, location }) => {
						if (!mismatch[slotKey]) mismatch[slotKey] = [];
						mismatch[slotKey].push(makeArray(builds[location].mainStat[slotKey])[0]);
						return mismatch;
					}, {}),
				potentials: artifacts.map(pget('potential')),
			})),
		);

		return {
			missingMainStat: pipe(
				artifactSetPriority,
				toPairs,
				filter(([, { mainStats }]) => Object.keys(mainStats).length > 0),
				sortBy(([, { mainStats }]) => -Object.values(mainStats).flat().length),
				map(([a, { mainStats }]) => [a, mainStats] as [string, Record<string, StatKey[]>]),
			),
			lowPotential: pipe(
				artifactSetPriority,
				mapValues(({ potentials }) => [
					potentials.length,
					potentials.filter((potential) => potential < 0.3).length,
				]),
				toPairs,
				filter(([, [, count]]) => Boolean(count)),
				sortBy(([, [, count]]) => -count),
			),
		};
	}, [artifacts]);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Artifact Set Farm Priority</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<PageSection title='Missing Main Stats'>
						<Grid container spacing={1}>
							{missingMainStat.map(([artifactSet, mainStat]) => (
								<Grid key={artifactSet}>
									<ArtifactSetImage
										artifactSet={artifactSetsInfo[artifactSet]}
										tooltip={
											<Fragment>
												{Object.entries(mainStat).map(([slot, stats]) => (
													<Typography key={slot}>
														{capitalCase(slot)}:{' '}
														{unique(stats.flat())
															.map((stat) => statName[stat])
															.join(', ')}
													</Typography>
												))}
											</Fragment>
										}>
										<Typography position='absolute' top={0} left={2}>
											{Object.values(mainStat).flat().length}
										</Typography>
									</ArtifactSetImage>
								</Grid>
							))}
						</Grid>
					</PageSection>
					<PageSection title='Low Potential'>
						<Grid container spacing={1}>
							{lowPotential.map(([artifactSet, [total, count]]) => (
								<Grid key={artifactSet}>
									<ArtifactSetImage artifactSet={artifactSetsInfo[artifactSet]}>
										<Typography position='absolute' top={0} left={2}>
											{count} / {total}
										</Typography>
									</ArtifactSetImage>
								</Grid>
							))}
						</Grid>
					</PageSection>
				</DialogContent>
			</ModalDialog>
		</ModalWrapper>
	);
}
