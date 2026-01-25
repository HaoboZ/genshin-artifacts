import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import { buildsList } from '@/api/builds';
import { statName } from '@/api/stats';
import OverlayText from '@/components/overlayText';
import PageSection from '@/components/page/pageSection';
import getFirst from '@/helpers/getFirst';
import { potentialPercent } from '@/helpers/stats';
import isMainStat from '@/helpers/stats/isMainStat';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import { useAppSelector } from '@/store/hooks';
import { type ArtifactSetKey, type IArtifact } from '@/types/good';
import { DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo } from 'react';
import {
	entries,
	fromKeys,
	groupBy,
	join,
	map,
	mapValues,
	pickBy,
	pipe,
	prop,
	sortBy,
	sumBy,
	values,
} from 'remeda';
import ArtifactSetImage from '../artifactSetImage';

export default function ArtifactFarmModal() {
	const artifacts = useAppSelector(prop('good', 'artifacts'));

	const incompleteArtifacts = useMemo(() => {
		const artifactsIndexed = pipe(
			artifacts,
			groupBy<IArtifact>(prop('setKey')),
			mapValues((artifacts) =>
				pipe(
					artifacts,
					groupBy(prop('slotKey')),
					mapValues((artifacts) => sortBy(artifacts, [prop('rarity'), 'desc'])),
				),
			),
		);

		const incompleteArtifactSets: Record<
			ArtifactSetKey,
			{ missing: number; rarity: number; slots: Record<string, Set<string>> }
		> = mapValues(artifactSetsInfo, () => ({
			missing: 0,
			rarity: 0,
			slots: fromKeys(artifactSlotOrder, () => new Set<string>()),
		}));

		for (const build of buildsList) {
			const setKey = getFirst(build.artifact);
			for (const slotKey of artifactSlotOrder) {
				const stat =
					{ flower: 'hp', plume: 'atk' }[slotKey] ?? getFirst(build.mainStat[slotKey]);
				const artifacts = artifactsIndexed[setKey]?.[slotKey];
				const index = artifacts?.findIndex((artifact) => isMainStat(build, artifact, true));
				if (!artifacts?.length || index === -1) {
					incompleteArtifactSets[setKey].missing++;
					incompleteArtifactSets[setKey].rarity++;
					incompleteArtifactSets[setKey].slots[slotKey]?.add(stat);
					continue;
				}
				const artifact = artifacts.splice(index, 1)[0];
				if (artifact.rarity !== artifactSetsInfo[artifact.setKey].rarity) {
					incompleteArtifactSets[setKey].rarity++;
					incompleteArtifactSets[setKey].slots[slotKey]?.add(stat);
				}
			}
		}

		return pipe(
			incompleteArtifactSets,
			mapValues(({ slots, ...other }) => ({
				...other,
				slots: pipe(
					slots,
					pickBy((set) => set.size > 0),
					mapValues((slots) =>
						pipe(
							slots,
							Array.from<string>,
							map((stat) => statName[stat]),
							join(', '),
						),
					),
					entries(),
				),
			})),
			pickBy(({ missing, rarity }) => missing > 0 || rarity > 0),
			entries(),
			groupBy((value) => artifactSetsInfo[value[0]].group),
			values(),
			sortBy(
				[(sets) => sumBy(sets, prop(1, 'missing')), 'desc'],
				[(sets) => sumBy(sets, prop(1, 'rarity')), 'desc'],
			),
		);
	}, [artifacts]);

	const lowPotential = useMemo(() => {
		const artifactsIndexed = groupBy<IArtifact>(artifacts, prop('location'));

		const incompleteArtifactSets: Record<ArtifactSetKey, { bad: number; total: number }> =
			mapValues(artifactSetsInfo, () => ({ bad: 0, total: 0 }));

		for (const build of buildsList) {
			const setKey = getFirst(build.artifact);
			for (const slotKey of artifactSlotOrder) {
				incompleteArtifactSets[setKey].total++;
				const artifact = artifactsIndexed[build.key]?.find(
					(artifact) => artifact.slotKey === slotKey,
				);
				const potential = potentialPercent(build, artifact);
				if (potential < 0.3) incompleteArtifactSets[setKey].bad++;
			}
		}

		return pipe(
			incompleteArtifactSets,
			pickBy(({ bad }) => bad > 0),
			entries(),
			groupBy((value) => artifactSetsInfo[value[0]].group),
			values(),
			sortBy([(sets) => sumBy(sets, prop(1, 'bad')), 'desc']),
		);
	}, [artifacts]);

	return (
		<DialogWrapper>
			<DialogTitle>Artifact Set Farm Priority</DialogTitle>
			<DialogContent>
				<PageSection title='Incomplete Artifacts'>
					<Grid container spacing={1}>
						{incompleteArtifacts.map((setGroups, index) => (
							<Grid key={index}>
								{setGroups.map(([artifactSet, { missing, rarity, slots }]) => (
									<ArtifactSetImage
										sx={{ height: 100 / setGroups.length }}
										key={artifactSet}
										artifactSet={artifactSetsInfo[artifactSet]}
										tooltip={
											<Fragment>
												<Typography variant='subtitle2'>
													{artifactSetsInfo[artifactSet].name}
												</Typography>
												{slots.map(([slot, stats]) => (
													<Typography key={slot} variant='body2'>
														{capitalCase(slot)}: {Array.from(stats)}
													</Typography>
												))}
											</Fragment>
										}>
										<OverlayText>
											{missing} / {rarity}
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
								{setGroups.map(([artifactSet, { bad, total }]) => (
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
