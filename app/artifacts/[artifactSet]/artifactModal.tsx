import { artifactSetsInfo, missingArtifactSets, useArtifacts } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { statName, weightedStatRollPercent } from '@/api/stats';
import OverflowTypography from '@/components/overflowTypography';
import PercentBar from '@/components/percentBar';
import SubStatBar from '@/components/subStatBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import statArrMatch from '@/src/helpers/statArrMatch';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import {
	Box,
	DialogTitle,
	FormControl,
	FormLabel,
	Grid,
	ModalClose,
	ModalDialog,
	Switch,
	Typography,
} from '@mui/joy';
import { useMemo, useState } from 'react';
import { filter, map, pipe, reverse, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import ArtifactActions from '../artifactActions';
import ArtifactImage from '../artifactImage';

export default function ArtifactModal({ artifact }: { artifact: IArtifact }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const artifacts = useArtifacts({ slot: artifact.slotKey });

	const [checked, setChecked] = useState(false);

	const charactersTiered = useMemo(
		() =>
			pipe(
				[...Object.values(builds), ...Object.values(missingArtifactSets)],
				filter(
					(build) =>
						(checked
							? arrDeepIndex(build.artifact, artifact.setKey) !== -1
							: makeArray(build.artifact[0])[0] === artifact.setKey) &&
						statArrMatch(build.mainStat[artifact.slotKey], artifact.mainStatKey),
				),
				map((build) => ({ build, statRollPercent: weightedStatRollPercent(build, artifact) })),
				sortBy(pget('statRollPercent')),
				reverse(),
			),
		[artifact, checked],
	);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>{artifactSetsInfo[artifact.setKey].name}</DialogTitle>
				<ModalClose variant='outlined' />
				<ArtifactActions artifact={artifact} />
				<Grid container spacing={1}>
					<Grid xs='auto'>
						<ArtifactImage artifact={artifact}>
							{artifact.location && (
								<CharacterImage
									character={charactersInfo[artifact.location]}
									size={50}
									position='absolute'
									bottom={0}
									right={0}
									border={1}
								/>
							)}
						</ArtifactImage>
					</Grid>
					<Grid xs>
						<Typography>{statName[artifact.mainStatKey]}</Typography>
						{artifact.substats.map((substat) => (
							<SubStatBar key={substat.key} substat={substat} />
						))}
					</Grid>
				</Grid>
				<FormControl orientation='horizontal'>
					<FormLabel>All Tiered Sets</FormLabel>
					<Switch
						size='lg'
						sx={{ ml: 0 }}
						checked={checked}
						onChange={({ target }) => setChecked(target.checked)}
					/>
				</FormControl>
				<Grid container spacing={1} sx={{ overflowY: 'auto' }}>
					{charactersTiered.map(({ build, statRollPercent }) => {
						const currentArtifact = artifacts.find(
							(artifact) => artifact.location === build.key,
						);
						return (
							<Grid key={build.key} container xs={6} md={4}>
								<Grid xs='auto'>
									<CharacterImage
										character={charactersInfo[build.key]}
										sx={{ ':hover': { cursor: 'pointer' } }}
										onClick={() => {
											if (artifact.location === build.key) {
												alert(`Already equipped on ${charactersInfo[build.key].name}`);
												return;
											}
											if (
												!confirm(
													`Give this artifact to ${charactersInfo[build.key].name}?`,
												)
											)
												return;
											dispatch(goodActions.giveArtifact([build.key, artifact]));
											closeModal();
										}}>
										{currentArtifact && (
											<ArtifactImage
												artifact={currentArtifact}
												size={50}
												position='absolute'
												bottom={0}
												right={0}
												border={1}
											/>
										)}
									</CharacterImage>
								</Grid>
								<Grid xs>
									{currentArtifact && (
										<Box>
											<OverflowTypography>
												{statName[currentArtifact.mainStatKey]}
											</OverflowTypography>
											{currentArtifact.substats.map((substat) => (
												<SubStatBar key={substat.key} substat={substat} />
											))}
										</Box>
									)}
								</Grid>
								<Grid container xs={12} spacing={0}>
									<Grid xs={6}>
										{currentArtifact && (
											<PercentBar p={weightedStatRollPercent(build, currentArtifact)}>
												Current: %p
											</PercentBar>
										)}
									</Grid>
									<Grid xs={6}>
										<PercentBar p={statRollPercent}>New: %p</PercentBar>
									</Grid>
								</Grid>
							</Grid>
						);
					})}
				</Grid>
			</ModalDialog>
		</ModalWrapper>
	);
}
