import PageSection from '@/components/page/section';
import pget from '@/src/helpers/pget';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppSelector } from '@/src/store/hooks';
import { DialogContent, DialogTitle, Grid, ModalClose, ModalDialog, Typography } from '@mui/joy';
import { useMemo } from 'react';
import { filter, groupBy, map, mapValues, pipe, sortBy, toPairs } from 'remeda';
import { artifactSetsInfo } from './artifactData';
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
				mainStats: artifacts.map(({ tier }) => !tier.mainStat).filter(Boolean).length,
				potential: artifacts.map(({ tier }) => tier.potential),
			})),
		);

		return {
			missingMainStat: pipe(
				artifactSetPriority,
				toPairs,
				filter(([, { mainStats }]) => mainStats > 0),
				sortBy(
					([, { potential }]) => -potential,
					([, { mainStats }]) => -mainStats,
				),
				map(([a, { mainStats }]) => [a, mainStats]),
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
									<ArtifactSetImage artifactSet={artifactSetsInfo[artifactSet]}>
										<Typography position='absolute' top={0} left={2}>
											{mainStat}
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
