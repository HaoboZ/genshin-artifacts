import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import type { StatKey } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid, ModalClose, ModalDialog, Typography } from '@mui/joy';
import { capitalCase } from 'change-case';
import { Fragment, useMemo } from 'react';
import { filter, groupBy, map, mapValues, pipe, sortBy, toPairs, uniq } from 'remeda';
import { charactersTier } from '../characters/characterData';
import { artifactSetsInfo, statName } from './artifactData';
import ArtifactSetImage from './artifactSetImage';
import useArtifactsTiered from './useArtifactsTiered';

export default function ArtifactSetFarmModal() {
	const artifacts = useAppSelector(pget('good.artifacts'));
	const artifactsFiltered = useMemo(
		() => artifacts.filter(({ location }) => location),
		[artifacts],
	);
	const artifactsTiered = useArtifactsTiered(artifactsFiltered);

	const { missingMainStat, lowPotential } = useMemo(() => {
		const artifactSetPriority = pipe(
			artifactsTiered,
			groupBy(({ setKey }) => setKey),
			mapValues((artifacts) => ({
				mainStats: artifacts
					.filter(({ tier }) => !tier.mainStat)
					.reduce((missing, { slotKey, location }) => {
						if (!missing[slotKey]) missing[slotKey] = [];
						missing[slotKey].push(makeArray(charactersTier[location].mainStat[slotKey])[0]);
						return missing;
					}, {}),
				potential: artifacts.map(({ tier }) => tier.potential),
			})),
		);

		return {
			missingMainStat: pipe(
				artifactSetPriority,
				toPairs,
				filter(([, { mainStats }]) => Object.keys(mainStats).length > 0),
				sortBy(
					([, { potential }]) => -potential,
					([, { mainStats }]) => -Object.values(mainStats).flat().length,
				),
				map(([a, { mainStats }]) => [a, mainStats] as [string, Record<string, StatKey[]>]),
			),
			lowPotential: pipe(
				artifactSetPriority,
				mapValues(({ potential }) => [
					potential.length,
					potential.filter((p) => p < 0.3).length,
				]),
				toPairs,
				filter(([, [, count]]) => Boolean(count)),
				sortBy(([, [, count]]) => -count),
			),
		};
	}, [artifactsTiered]);

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
														{uniq(stats.flat())
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
