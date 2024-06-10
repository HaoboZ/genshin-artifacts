'use client';
import { artifactSlotOrder } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { elementsInfo } from '@/api/elements';
import { weightedStatRollPercent } from '@/api/stats';
import { weaponsInfo } from '@/api/weapons';
import FormattedInput from '@/components/formattedInput';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Card, FormLabel, Grid, Link, Stack, Switch, Typography } from '@mui/joy';
import { pascalSnakeCase } from 'change-case';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Fragment, useMemo } from 'react';
import { clamp, indexBy } from 'remeda';
import ArtifactStatImage from '../../artifacts/artifactStatImage';
import WeaponImage from '../../weapons/weaponImage';
import CharacterImage from '../characterImage';
import CharacterArtifactModal from './characterArtifactModal';
import CharacterBuild from './characterBuild';
import CharacterWeaponModal from './characterWeaponModal';

export default function Character({ params }: { params: { name: string } }) {
	const characterData = charactersInfo[params.name];
	if (!characterData) notFound();

	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const character = useAppSelector(({ good }) =>
		good.characters.find(({ key }) => key === characterData.key),
	);
	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === characterData.key),
	);
	const artifacts = useAppSelector(pget('good.artifacts'));
	const artifactsIndexed = useMemo(
		() =>
			indexBy(
				artifacts.filter(({ location }) => location === characterData.key),
				pget('slotKey'),
			),
		[artifacts],
	);

	const build = builds[characterData.key];
	const weaponTier = useMemo(() => {
		if (!weapon) return 0;
		const index = arrDeepIndex(build.weapon, weapon.key);
		return index !== -1 ? 1 - index / build.weapon.length : 0;
	}, [build, weapon]);

	return (
		<PageContainer noSsr>
			<PageTitle>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Link
						href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(characterData.name)}`}
						target='_blank'
						variant='plain'
						color='neutral'>
						{characterData.name}
					</Link>
					{characterData.element !== 'None' && (
						<Image
							alt={characterData.element}
							src={elementsInfo[characterData.element]}
							width={30}
							height={30}
						/>
					)}
					<Switch
						size='lg'
						sx={{ ml: 0 }}
						checked={Boolean(character)}
						onChange={() => dispatch(goodActions.toggleCharacter(characterData.key))}
					/>
				</Stack>
			</PageTitle>
			<CharacterImage character={characterData} />
			<CharacterBuild build={build} />
			{character && (
				<Fragment>
					<PageSection title='Talents'>
						<Grid container spacing={1}>
							{[
								['auto', 'Auto Attack'],
								['skill', 'Elemental Skill'],
								['burst', 'Elemental Burst'],
							].map(([type, name]) => (
								<Grid key={type} xs={4}>
									<FormLabel>{name}</FormLabel>
									<FormattedInput
										value={character.talent[type]}
										onChange={({ target }) =>
											dispatch(
												goodActions.editSkills({
													character: character.key,
													talent: {
														[type]: clamp(+target.value, { min: 1, max: 10 }),
													},
												}),
											)
										}
									/>
								</Grid>
							))}
						</Grid>
					</PageSection>
					<PageSection title='Equipped'>
						<Grid container spacing={1}>
							<Grid xs={6} sm={4}>
								<Card
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => {
										showModal(CharacterWeaponModal, { props: { build, weapon } });
									}}>
									<Grid container spacing={1}>
										<Grid xs='auto'>
											<WeaponImage
												weapon={weaponsInfo[weapon?.key]}
												type={characterData.weaponType}
											/>
										</Grid>
										{weapon && (
											<Fragment>
												<Grid xs>
													<Typography>{weaponsInfo[weapon?.key]?.name}</Typography>
												</Grid>
												<Grid xs={12}>
													<PercentBar p={weaponTier} />
												</Grid>
											</Fragment>
										)}
									</Grid>
								</Card>
							</Grid>
							{artifactSlotOrder.map((slot) => {
								const artifact = artifactsIndexed[slot];
								const statRollPercent = weightedStatRollPercent(build, artifact);

								return (
									<Grid key={slot} xs={6} sm={4}>
										<ArtifactStatImage
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
												<Grid xs={12}>
													<PercentBar p={statRollPercent} />
												</Grid>
											)}
										</ArtifactStatImage>
									</Grid>
								);
							})}
						</Grid>
					</PageSection>
				</Fragment>
			)}
		</PageContainer>
	);
}
