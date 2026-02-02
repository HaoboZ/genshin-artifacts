import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import PageSection from '@/components/page/pageSection';
import PercentBar from '@/components/stats/percentBar';
import StatChipArray from '@/components/stats/statChipArray';
import makeArray from '@/helpers/makeArray';
import { weightedPercent } from '@/helpers/stats';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { useAppSelector } from '@/store/hooks';
import { type Build } from '@/types/data';
import { type ICharacter } from '@/types/good';
import { AvatarGroup, Grid, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useMemo } from 'react';
import { indexBy, prop } from 'remeda';
import ArtifactSetImage from '../../artifacts/artifactSetImage';
import ArtifactStatCard from '../../artifacts/artifactStatCard';
import CharacterWeaponTier from './characterWeaponTier';
import WeaponCard from './weaponCard';

const CharacterOptimizeModal = dynamicModal(() => import('./characterOptimizeModal'));
const CharacterArtifactModal = dynamicModal(() => import('./characterArtifactModal'));
const CharacterWeaponModal = dynamicModal(() => import('./characterWeaponModal'));

export default function CharacterBuild({
	character,
	build,
}: {
	character: ICharacter;
	build: Build;
}) {
	const { showModal } = useModal();

	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === build.key),
	);

	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const artifactsIndexed = useMemo(() => {
		return indexBy(
			artifacts.filter(
				({ location, buildIndex }) => location === build.key && build.buildIndex === buildIndex,
			),
			prop('slotKey'),
		);
	}, [artifacts, build]);

	return (
		<PageSection
			title={`Build: ${build.role}`}
			actions={[
				{
					name: 'Optimize',
					onClick: () => {
						showModal(CharacterOptimizeModal, {
							props: { build, weapon, artifactsIndexed },
						});
					},
				},
			]}>
			<Stack spacing={1}>
				{Boolean(build.weapon.length) && (
					<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
						<Typography>Weapon:</Typography>
						<CharacterWeaponTier build={build} />
					</Stack>
				)}
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Artifacts:</Typography>
					{build.artifact.map((artifactTier, index) => (
						<AvatarGroup key={index} variant='rounded'>
							{makeArray(artifactTier).map((artifact) => (
								<ArtifactSetImage
									key={artifact}
									artifactSet={artifactSetsInfo[artifact]}
									size={50}
									component={Link}
									// @ts-expect-error link
									href={`/artifacts/${artifact}`}
								/>
							))}
						</AvatarGroup>
					))}
				</Stack>
				<StatChipArray mapStats name='Sands' arr={makeArray(build.mainStat.sands)} />
				<StatChipArray mapStats name='Goblet' arr={makeArray(build.mainStat.goblet)} />
				<StatChipArray mapStats name='Circlet' arr={makeArray(build.mainStat.circlet)} />
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={build.subStat} />
				<Grid container spacing={1}>
					<Grid size={{ xs: 6, sm: 4 }}>
						{character && (
							<WeaponCard
								build={build}
								weapon={weapon}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									showModal(CharacterWeaponModal, { props: { build, weapon } });
								}}
							/>
						)}
					</Grid>
					{artifactSlotOrder.map((slot) => {
						const artifact = artifactsIndexed[slot];

						return (
							<Grid key={slot} size={{ xs: 6, sm: 4 }}>
								<ArtifactStatCard
									hideCharacter
									artifact={artifact}
									slot={slot}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => {
										showModal(CharacterArtifactModal, {
											props: { build, slot, artifact },
										});
									}}>
									{artifact && (
										<Grid size={12}>
											<PercentBar p={weightedPercent(build, artifact)} />
										</Grid>
									)}
								</ArtifactStatCard>
							</Grid>
						);
					})}
				</Grid>
			</Stack>
		</PageSection>
	);
}
