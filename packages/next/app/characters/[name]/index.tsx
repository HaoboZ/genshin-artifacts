'use client';
import { builds } from '@/api/builds';
import { elementsInfo } from '@/api/elements';
import FormattedTextField from '@/components/formattedTextField';
import PageLink from '@/components/page/pageLink';
import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import makeArray from '@/helpers/makeArray';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type DCharacter } from '@/types/data';
import { Container, Grid, Stack, Switch } from '@mui/material';
import { pascalSnakeCase } from 'change-case';
import Image from 'next/image';
import { clamp } from 'remeda';
import CharacterImage from '../characterImage';
import CharacterBuild from './characterBuild';

const talents = [
	['auto', 'Auto Attack'],
	['skill', 'Elemental Skill'],
	['burst', 'Elemental Burst'],
];

export default function Character({ characterData }: { characterData: DCharacter }) {
	const dispatch = useAppDispatch();

	const character = useAppSelector(({ good }) =>
		good.characters.find(({ key }) => key === characterData.key),
	);

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
			{makeArray(builds[characterData.key]).map((build, index) => (
				<CharacterBuild key={index} character={character} build={build} />
			))}
		</Container>
	);
}
