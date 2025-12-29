import { artifactSlotOrder } from '@/api/artifacts';
import { charactersInfo } from '@/api/characters';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import { statArrMatch, weightedPercent } from '@/helpers/stats';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import type { Build } from '@/types/data';
import { type IArtifact, type IWeapon, type SlotKey } from '@/types/good';
import { DoubleArrow as DoubleArrowIcon } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { useMemo } from 'react';
import { entries, filter, firstBy, map, pipe, prop } from 'remeda';
import ArtifactStatCard from '../../artifacts/artifactStatCard';
import WeaponCard from './weaponCard';

export default function CharacterOptimizeModal({
	build,
	weapon,
	artifactsIndexed,
}: {
	build: Build;
	weapon: IWeapon;
	artifactsIndexed: Record<SlotKey, IArtifact>;
}) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();
	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const weapons = useAppSelector(prop('good', 'weapons'));

	const characterData = charactersInfo[build.key];

	const bestWeapon = useMemo(() => {
		return pipe(
			weapons,
			filter(({ key }) => arrDeepIndex(build.weapon, key) !== -1),
			firstBy(({ key }) => arrDeepIndex(build.weapon, key)),
		);
	}, [weapons, build]);

	const artifactsSorted = useMemo(() => {
		const newArtifacts = artifactSlotOrder.map((slot) => {
			return [
				slot,
				[
					artifactsIndexed[slot],
					pipe(
						artifacts,
						filter(
							({ slotKey, setKey, mainStatKey }) =>
								slotKey === slot &&
								arrDeepIndex(build.artifact, setKey) === 0 &&
								statArrMatch(build.mainStat[slot], mainStatKey),
						),
						map((artifact) => ({
							...artifact,
							statRollPercent: weightedPercent(build, artifact),
						})),
						firstBy([prop('statRollPercent'), 'desc']),
					),
				],
			] as [SlotKey, (IArtifact & { statRollPercent?: number })[]];
		});

		const [slot, setArtifacts] = firstBy(newArtifacts, prop(1, 1, 'statRollPercent'));
		setArtifacts[1] = pipe(
			artifacts,
			filter(
				({ slotKey, mainStatKey }) =>
					slotKey === slot && statArrMatch(build.mainStat[slot], mainStatKey),
			),
			map((artifact) => ({
				...artifact,
				statRollPercent: weightedPercent(build, artifact),
			})),
			firstBy([prop('statRollPercent'), 'desc']),
		);

		return Object.fromEntries(newArtifacts) as Record<
			SlotKey,
			(IArtifact & { statRollPercent?: number })[]
		>;
	}, [build, artifacts, artifactsIndexed]);

	return (
		<DialogWrapper>
			<DialogTitle>Optimize {characterData.name}</DialogTitle>
			<DialogContent>
				<Grid container spacing={2}>
					{weapon?.key !== bestWeapon?.key && (
						<Grid size={12} container>
							<Grid size='grow'>
								<WeaponCard build={build} weapon={weapon} />
							</Grid>
							<Grid size='auto' sx={{ display: 'flex', alignItems: 'center' }}>
								<DoubleArrowIcon />
							</Grid>
							<Grid size='grow'>
								<WeaponCard build={build} weapon={bestWeapon} />
							</Grid>
						</Grid>
					)}
					{entries(artifactsSorted).map(([slot, [artifact, newArtifact]]) => {
						if (artifact?.id === newArtifact?.id) return null;

						return (
							<Grid key={slot} size={12} container>
								<Grid size='grow'>
									<ArtifactStatCard hideCharacter artifact={artifact} slot={slot}>
										{artifact && (
											<Grid size={12}>
												<PercentBar p={weightedPercent(build, artifact)} />
											</Grid>
										)}
									</ArtifactStatCard>
								</Grid>
								<Grid size='auto' sx={{ display: 'flex', alignItems: 'center' }}>
									<DoubleArrowIcon />
								</Grid>
								<Grid key={slot} size='grow'>
									<ArtifactStatCard hideCharacter artifact={newArtifact} slot={slot}>
										{newArtifact && (
											<Grid size={12}>
												<PercentBar p={weightedPercent(build, newArtifact)} />
											</Grid>
										)}
									</ArtifactStatCard>
								</Grid>
							</Grid>
						);
					})}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						if (weapon?.key !== bestWeapon?.key) {
							dispatch(goodActions.giveWeapon([build.key, bestWeapon]));
						}
						for (const [artifact, newArtifact] of Object.values(artifactsSorted)) {
							if (artifact?.id !== newArtifact?.id) {
								dispatch(goodActions.giveArtifact([build.key, newArtifact]));
							}
						}
						closeModal();
					}}>
					Save
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
