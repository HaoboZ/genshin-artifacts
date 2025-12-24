import { artifactSetsInfo } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { statName } from '@/api/stats';
import OverlayText from '@/components/overlayText';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import { potentialPercent } from '@/src/helpers/stats';
import isMainStat from '@/src/helpers/stats/isMainStat';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import { type ArtifactSetKey } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { capitalCase } from 'change-case';
import { useMemo } from 'react';
import {
	entries,
	filter,
	groupBy,
	join,
	map,
	mapValues,
	pickBy,
	pipe,
	prop,
	reverse,
	sortBy,
	sumBy,
	unique,
	values,
} from 'remeda';
import ArtifactSetImage from '../artifactSetImage';

export default function ArtifactSetFarmModal() {
	const artifacts = useAppSelector(prop('good', 'artifacts'));

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
			groupBy(prop('setKey')),
			mapValues((artifacts) => ({
				badArtifacts: artifacts.filter(
					({ mainStatMismatch, notMaxRarity }) => mainStatMismatch || notMaxRarity,
				),
				potentials: artifacts.map(prop('potential')),
			})),
		);

		return {
			incompleteArtifacts: pipe(
				artifactSetPriority,
				mapValues(({ badArtifacts }) => ({
					mainStat: badArtifacts.filter(prop('mainStatMismatch')).length,
					total: badArtifacts.length,
					slots: pipe(
						badArtifacts,
						groupBy(prop('slotKey')),
						mapValues((slots) =>
							pipe(
								slots,
								map(
									({ location, slotKey }) =>
										makeArray(builds[location].mainStat[slotKey])[0],
								),
								unique(),
								map((stat) => statName[stat]),
								join(', '),
							),
						),
						entries(),
					),
				})),
				pickBy(({ total }) => total > 0),
				entries(),
				groupBy((value) => artifactSetsInfo[value[0]].group),
				values(),
				sortBy(
					[(sets) => sumBy(sets, prop(1, 'mainStat')), 'desc'],
					[(sets) => sumBy(sets, prop(1, 'total')), 'desc'],
				),
			),
			lowPotential: pipe(
				artifactSetPriority,
				mapValues(({ potentials }) => ({
					total: potentials.length,
					bad: potentials.filter((potential) => potential < 0.3).length,
				})),
				pickBy(({ bad }) => Boolean(bad)),
				entries(),
				groupBy((value) => artifactSetsInfo[value[0]].group),
				values(),
				reverse(),
				sortBy([(sets) => sumBy(sets, prop(1, 'bad')), 'desc']),
			),
		};
	}, [artifacts]);

	return (
		<DialogWrapper>
			<DialogTitle>Artifact Set Farm Priority</DialogTitle>
			<DialogContent>
				<PageSection title='Incomplete Artifacts'>
					<Grid container spacing={1}>
						{incompleteArtifacts.map((setGroups, index) => (
							<Grid key={index}>
								{setGroups.map(([artifactSet, { mainStat, total, slots }]) => (
									<ArtifactSetImage
										sx={{ height: 100 / setGroups.length }}
										key={artifactSet}
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
								))}
							</Grid>
						))}
					</Grid>
				</PageSection>
				<PageSection title='Low Potential'>
					<Grid container spacing={1}>
						{lowPotential.map((setGroups, index) => (
							<Grid key={index}>
								{setGroups.map(([artifactSet, { total, bad }]) => (
									<ArtifactSetImage
										sx={{ height: 100 / setGroups.length }}
										key={artifactSet}
										artifactSet={artifactSetsInfo[artifactSet]}>
										<OverlayText>
											{bad} / {total}
										</OverlayText>
									</ArtifactSetImage>
								))}
							</Grid>
						))}
					</Grid>
				</PageSection>
			</DialogContent>
		</DialogWrapper>
	);
}
