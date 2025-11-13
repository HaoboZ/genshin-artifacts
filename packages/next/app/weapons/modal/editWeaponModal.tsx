import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PageLink from '@/components/page/link';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
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
import { filter, map, pipe, sortBy } from 'remeda';
import { useModalControls } from '../../../src/providers/modal/controls';
import CharacterWeaponTier from '../../characters/[name]/characterWeaponTier';
import CharacterImage from '../../characters/characterImage';
import WeaponForm from '../weaponForm';
import WeaponImage from '../weaponImage';

export default function EditWeaponModal({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const weapons = useAppSelector(pget('good.weapons'));
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(false);

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			builds,
			Object.values<Build>,
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
				{({ values, setFieldValue }) => (
					<WeaponForm deleteButton>
						{values.location && (
							<Fragment>
								<Box>
									<Button variant='outlined' onClick={() => setFieldValue('location', '')}>
										Remove
									</Button>
								</Box>
								<Stack direction='row' spacing={1}>
									<CharacterImage character={charactersInfo[values.location]} />
									<Box>
										<Typography sx={{ my: 0.5 }}>
											{builds[values.location].role}
										</Typography>
										<CharacterWeaponTier build={builds[values.location]} />
									</Box>
								</Stack>
							</Fragment>
						)}
						<FormControlLabel
							control={
								<Switch
									sx={{ ml: 0 }}
									checked={checked}
									onChange={({ target }) => setChecked(target.checked)}
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
									<PercentBar p={1 - buildIndex / build.weapon.length}>New %p</PercentBar>
									{oldWeapon && (
										<PercentBar
											p={
												oldTierIndex !== -1 ? 1 - oldTierIndex / build.weapon.length : 0
											}>
											Current %p
										</PercentBar>
									)}
								</Grid>
							))}
						</Grid>
					</WeaponForm>
				)}
			</Formik>
		</DialogWrapper>
	);
}
