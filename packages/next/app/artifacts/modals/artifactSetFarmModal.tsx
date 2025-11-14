import { artifactSetsInfo } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { statName } from '@/api/stats';
import OverlayText from '@/components/overlayText';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { potentialPercent } from '@/src/helpers/stats';
import isMainStat from '@/src/helpers/stats/isMainStat';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { capitalCase } from 'change-case';
import { useMemo } from 'react';
import { entries, filter, groupBy, map, mapValues, pipe, sortBy, unique } from 'remeda';
import ArtifactSetImage from '../artifactSetImage';

export default function ArtifactSetFarmModal() {
	const artifacts = useAppSelector(pget('good.artifacts'));

	const { incompleteArtifacts, lowPotential } = useMemo(() => {
		const artifactSetPriority = pipe(
			artifacts,
			filter(({ location }) => Boolean(location)),
			map((artifact) => {
				const bisArtifact = makeArray(builds[artifact.location].artifact[0])[0];

				return {
					...artifact,
					setKey: (bisArtifact === artifact.setKey
						? artifact.setKey
						: bisArtifact) as ArtifactSetKey,
					wantedMainStat: builds[artifact.location].mainStat[artifact.slotKey],
					mainStatMismatch:
						bisArtifact !== artifact.setKey ||
						!isMainStat(builds[artifact.location], artifact, true),
					notMaxRarity: artifact.rarity !== artifactSetsInfo[artifact.setKey].rarity,
					potential: potentialPercent(builds[artifact.location], artifact),
				};
			}),
			groupBy(pget('setKey')),
			mapValues((artifacts) => ({
				badArtifacts: artifacts.filter(
					({ mainStatMismatch, notMaxRarity }) => mainStatMismatch || notMaxRarity,
				),
				potentials: artifacts.map(pget('potential')),
			})),
		);

		return {
			incompleteArtifacts: pipe(
				artifactSetPriority,
				mapValues(({ badArtifacts }) => ({
					mainStat: badArtifacts.filter(pget('mainStatMismatch')).length,
					total: badArtifacts.length,
					slots: pipe(
						badArtifacts,
						groupBy(pget('slotKey')),
						mapValues((slots) =>
							pipe(
								slots,
								map(
									({ location, slotKey }) =>
										makeArray(builds[location].mainStat[slotKey])[0],
								),
								unique(),
								map((stat) => statName[stat]),
								(stats) => stats.join(', '),
							),
						),
						entries(),
					),
				})),
				entries(),
				filter(([, { total }]) => total > 0),
				sortBy([pget('1.mainStat'), 'desc'], [pget('1.total'), 'desc']),
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
				<PageSection title='Incomplete Artifacts'>
					<Grid container spacing={1}>
						{incompleteArtifacts.map(([artifactSet, { mainStat, total, slots }]) => (
							<Grid key={artifactSet}>
								<ArtifactSetImage
									artifactSet={artifactSetsInfo[artifactSet]}
									tooltip={slots.map(([slot, stats]) => (
										<Typography key={slot} variant='body2'>
											{capitalCase(slot)}: {stats}
										</Typography>
									))}>
									<OverlayText>
										{mainStat} / {total}
									</OverlayText>
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
									<OverlayText>
										{count} / {total}
									</OverlayText>
								</ArtifactSetImage>
							</Grid>
						))}
					</Grid>
				</PageSection>
			</DialogContent>
		</DialogWrapper>
	);
}
