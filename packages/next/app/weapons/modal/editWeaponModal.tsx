import { builds, buildsList } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PageLink from '@/components/page/pageLink';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import getFirst from '@/helpers/getFirst';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type IWeapon } from '@/types/good';
import {
	Box,
	Button,
	DialogTitle,
	FormControlLabel,
	Grid,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { pascalSnakeCase } from 'change-case';
import { Formik } from 'formik';
import { Fragment, useMemo, useState } from 'react';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import CharacterWeaponTier from '../../characters/[name]/characterWeaponTier';
import CharacterImage from '../../characters/characterImage';
import WeaponForm from '../weaponForm';
import WeaponImage from '../weaponImage';

export default function EditWeaponModal({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const weapons = useAppSelector(prop('good', 'weapons'));
	const priority = useAppSelector(prop('main', 'priority'));
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(false);

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			buildsList,
			filter(({ key }) => charactersInfo[key].weaponType === weaponsInfo[weapon.key].weaponType),
			map((build) => {
				const oldWeapon = weapons.find(({ location }) => location === build.key);
				const buildIndex = arrDeepIndex(build.weapon, weapon.key);
				return {
					build,
					buildIndex: buildIndex === -1 ? build.weapon.length : buildIndex,
					oldWeapon,
					oldTierIndex: oldWeapon && arrDeepIndex(build.weapon, oldWeapon.key),
				};
			}),
			filter(({ build, buildIndex }) => {
				if (checked) return true;
				return buildIndex !== build.weapon.length;
			}),
			sortBy(
				({ build, buildIndex }) => (buildIndex === build.weapon.length ? 1 : 0),
				({ build }) => {
					const index = priorityIndex.indexOf(build.key);
					return index === -1 ? Infinity : index;
				},
			),
		);
	}, [priority, weapon.key, weapons, checked]);

	return (
		<DialogWrapper>
			<DialogTitle>
				<PageLink
					href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(weapon.key)}`}
					target='_blank'
					underline='none'
					color='textPrimary'>
					{weaponsInfo[weapon.key].name}
				</PageLink>
			</DialogTitle>
			<Formik<IWeapon>
				initialValues={weapon}
				onSubmit={(values) => {
					dispatch(goodActions.giveWeapon([values.location, weapon]));
					dispatch(goodActions.editWeapon(values));
					closeModal();
				}}>
				{({ values, setFieldValue }) => {
					const build = getFirst(builds[values.location]);

					return (
						<WeaponForm deleteButton>
							{values.location && (
								<Fragment>
									<Box>
										<Button
											variant='outlined'
											color='error'
											onClick={() => setFieldValue('location', '')}>
											Remove
										</Button>
									</Box>
									<Stack direction='row' spacing={1}>
										<CharacterImage character={charactersInfo[values.location]} />
										<Box>
											<Typography sx={{ my: 0.5 }}>{build.role}</Typography>
											<CharacterWeaponTier build={build} />
										</Box>
									</Stack>
								</Fragment>
							)}
							<FormControlLabel
								control={
									<Switch
										sx={{ ml: 0 }}
										checked={checked}
										onChange={(_, checked) => setChecked(checked)}
									/>
								}
								label='All Characters'
							/>
							<Grid container spacing={1}>
								{characters.map(({ build, buildIndex, oldWeapon, oldTierIndex }, index) => (
									<Grid key={index}>
										<CharacterImage
											character={charactersInfo[build.key]}
											sx={{
												':hover': { cursor: 'pointer' },
												'border': build.key === values.location ? 2 : 0,
												'borderColor': 'blue',
											}}
											onClick={() => setFieldValue('location', build.key)}>
											{oldWeapon && (
												<WeaponImage
													hideStats
													weapon={oldWeapon}
													size={50}
													sx={{ position: 'absolute', bottom: 0, right: 0, border: 1 }}
												/>
											)}
										</CharacterImage>
										<PercentBar p={1 - buildIndex / build.weapon.length}>
											New %p
										</PercentBar>
										{oldWeapon && (
											<PercentBar
												p={
													oldTierIndex !== -1
														? 1 - oldTierIndex / build.weapon.length
														: 0
												}>
												Current %p
											</PercentBar>
										)}
									</Grid>
								))}
							</Grid>
						</WeaponForm>
					);
				}}
			</Formik>
		</DialogWrapper>
	);
}
