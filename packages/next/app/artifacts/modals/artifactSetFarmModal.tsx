import { artifactSetsInfo } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { potentialStatRollPercent, statName } from '@/api/stats';
import OverlayText from '@/components/overlayText';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import statArrMatch from '@/src/helpers/statArrMatch';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import type { StatKey } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid2, Typography } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo } from 'react';
import { entries, filter, groupBy, map, mapValues, pipe, sortBy, unique } from 'remeda';
import ArtifactSetImage from '../artifactSetImage';

export default function ArtifactSetFarmModal() {
	const artifacts = useAppSelector(pget('good.artifacts'));

	const { missingMainStat, lowPotential } = useMemo(() => {
		const artifactSetPriority = pipe(
			artifacts,
			filter(({ location }) => Boolean(location)),
			map((artifact) => ({
				...artifact,
				mainStatMismatch:
					artifact.slotKey !== 'flower' &&
					artifact.slotKey !== 'plume' &&
					!statArrMatch(
						builds[artifact.location].mainStat[artifact.slotKey],
						artifact.mainStatKey,
						true,
					),
				potential: potentialStatRollPercent(builds[artifact.location], artifact),
			})),
			groupBy(pget('setKey')),
			mapValues((artifacts) => ({
				mainStats: artifacts.filter(pget('mainStatMismatch')).reduce(
					(mismatch, { slotKey, location }) => {
						if (!mismatch[slotKey]) mismatch[slotKey] = [];
						mismatch[slotKey].push(makeArray(builds[location].mainStat[slotKey])[0]);
						return mismatch;
					},
					{} as Record<string, StatKey[]>,
				),
				potentials: artifacts.map(pget('potential')),
			})),
		);

		return {
			missingMainStat: pipe(
				artifactSetPriority,
				entries(),
				filter(([, { mainStats }]) => Object.keys(mainStats).length > 0),
				sortBy([([, { mainStats }]) => Object.values(mainStats).flat().length, 'desc']),
			),
			lowPotential: pipe(
				artifactSetPriority,
				mapValues(({ potentials }) => [
					potentials.length,
					potentials.filter((potential) => potential < 0.3).length,
				]),
				entries(),
				filter(([, [, count]]) => Boolean(count)),
				sortBy([pget('1.1'), 'desc']),
			),
		};
	}, [artifacts]);

	return (
		<DialogWrapper>
			<DialogTitle>Artifact Set Farm Priority</DialogTitle>
			<DialogContent>
				<PageSection title='Missing Main Stats'>
					<Grid2 container spacing={1}>
						{missingMainStat.map(([artifactSet, { mainStats }]) => (
							<Grid2 key={artifactSet}>
								<ArtifactSetImage
									artifactSet={artifactSetsInfo[artifactSet]}
									tooltip={
										<Fragment>
											{Object.entries(mainStats).map(([slot, stats]) => (
												<Typography key={slot}>
													{capitalCase(slot)}:{' '}
													{unique(stats.flat())
														.map((stat) => statName[stat])
														.join(', ')}
												</Typography>
											))}
										</Fragment>
									}>
									<OverlayText>{Object.values(mainStats).flat().length}</OverlayText>
								</ArtifactSetImage>
							</Grid2>
						))}
					</Grid2>
				</PageSection>
				<PageSection title='Low Potential'>
					<Grid2 container spacing={1}>
						{lowPotential.map(([artifactSet, [total, count]]) => (
							<Grid2 key={artifactSet}>
								<ArtifactSetImage artifactSet={artifactSetsInfo[artifactSet]}>
									<OverlayText>
										{count} / {total}
									</OverlayText>
								</ArtifactSetImage>
							</Grid2>
						))}
					</Grid2>
				</PageSection>
			</DialogContent>
		</DialogWrapper>
	);
}
