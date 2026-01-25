'use client';
import { artifactSlotOrder } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { elementsInfo } from '@/api/elements';
import FormattedTextField from '@/components/formattedTextField';
import PageLink from '@/components/page/pageLink';
import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import PercentBar from '@/components/stats/percentBar';
import getFirst from '@/helpers/getFirst';
import { weightedPercent } from '@/helpers/stats';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type DCharacter } from '@/types/data';
import { Container, Grid, Stack, Switch } from '@mui/material';
import { pascalSnakeCase } from 'change-case';
import Image from 'next/image';
import { useMemo } from 'react';
import { clamp, indexBy, prop } from 'remeda';
import ArtifactStatCard from '../../artifacts/artifactStatCard';
import CharacterImage from '../characterImage';
import CharacterBuild from './characterBuild';
import WeaponCard from './weaponCard';

const CharacterOptimizeModal = dynamicModal(() => import('./characterOptimizeModal'));
const CharacterArtifactModal = dynamicModal(() => import('./characterArtifactModal'));
const CharacterWeaponModal = dynamicModal(() => import('./characterWeaponModal'));

const talents = [
	['auto', 'Auto Attack'],
	['skill', 'Elemental Skill'],
	['burst', 'Elemental Burst'],
];

export default function Character({ characterData }: { characterData: DCharacter }) {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const character = useAppSelector(({ good }) =>
		good.characters.find(({ key }) => key === characterData.key),
	);
	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === characterData.key),
	);
	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const artifactsIndexed = useMemo(() => {
		return indexBy(
			artifacts.filter(({ location }) => location === characterData.key),
			prop('slotKey'),
		);
	}, [artifacts, characterData.key]);

	const build = getFirst(builds[characterData.key]);

	return (
		<Container>
			<PageTitle>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<PageLink
						href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(characterData.name)}`}
						target='_blank'
						underline='none'
						color='textPrimary'>
						{characterData.name}
					</PageLink>
					{characterData.element !== 'None' && (
						<Image
							alt={characterData.element}
							src={elementsInfo[characterData.element]}
							width={30}
							height={30}
						/>
					)}
					<Switch
						sx={{ ml: 0 }}
						checked={Boolean(character)}
						onChange={() => dispatch(goodActions.toggleCharacter(characterData.key))}
					/>
				</Stack>
			</PageTitle>
			<Stack direction='row' spacing={1}>
				<CharacterImage character={characterData} />
				{character && (
					<Stack spacing={1}>
						<FormattedTextField
							fullWidth={false}
							label='Level'
							value={character.level}
							onChange={(e) => {
								dispatch(
									goodActions.editCharacter({
										key: character.key,
										level: clamp(+e.target.value, { min: 1, max: 90 }),
									}),
								);
							}}
						/>
						<FormattedTextField
							fullWidth={false}
							label='Constellation'
							value={character.constellation}
							onChange={(e) => {
								dispatch(
									goodActions.editCharacter({
										key: character.key,
										constellation: clamp(+e.target.value, { min: 0, max: 6 }),
									}),
								);
							}}
						/>
					</Stack>
				)}
			</Stack>
			<CharacterBuild build={build} />
			{character && (
				<PageSection title='Talents'>
					<Grid container spacing={1}>
						{talents.map(([type, name]) => (
							<Grid key={type} size={4}>
								<FormattedTextField
									label={name}
									value={character.talent[type]}
									onChange={(e) => {
										dispatch(
											goodActions.editCharacter({
												key: character.key,
												talent: {
													[type]: clamp(+e.target.value, { min: 1, max: 10 }),
												},
											}),
										);
									}}
								/>
							</Grid>
						))}
					</Grid>
				</PageSection>
			)}
			<PageSection
				title='Equipped'
				actions={[
					{
						name: 'Optimize',
						onClick: () => {
							showModal(CharacterOptimizeModal, {
								props: {
									build,
									weapon,
									artifactsIndexed,
								},
							});
						},
					},
				]}>
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
			</PageSection>
		</Container>
	);
}
