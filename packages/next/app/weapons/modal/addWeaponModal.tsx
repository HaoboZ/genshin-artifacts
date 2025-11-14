import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal/controls';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IWeapon, WeaponKey } from '@/src/types/good';
import { Autocomplete, DialogTitle, Grid, TextField } from '@mui/material';
import { Formik } from 'formik';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponForm from '../weaponForm';

export default function AddWeaponModal() {
	const dispatch = useAppDispatch();
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const [weapon, setWeapon] = useState<WeaponKey>(null);

	const characters = useMemo(() => {
		if (!weapon) return [];
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			builds,
			Object.values<Build>,
			filter(({ key }) => charactersInfo[key].weaponType === weaponsInfo[weapon].weaponType),
			map((build) => ({
				build,
				buildIndex: arrDeepIndex(build.weapon, weapon),
			})),
			filter(({ buildIndex }) => buildIndex !== -1),
			sortBy(({ build }) => {
				const index = priorityIndex.indexOf(build.key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [priority, weapon]);

	return (
		<DialogWrapper>
			<DialogTitle>Add Weapon</DialogTitle>
			<Formik<IWeapon>
				initialValues={{
					id: nanoid(),
					key: '',
					level: 1,
					ascension: 0,
					refinement: 1,
					location: '',
					lock: false,
				}}
				onSubmit={(weapon) => {
					dispatch(goodActions.addWeapon(weapon));
					closeModal();
				}}>
				{({ setFieldValue }) => (
					<WeaponForm>
						<Autocomplete
							fullWidth
							autoHighlight
							sx={{ pt: 1 }}
							renderInput={(params) => <TextField {...params} label='Select Weapon' />}
							options={Object.keys(weaponsInfo)}
							getOptionLabel={(key) => weaponsInfo[key].name}
							value={weapon as any}
							onChange={(_, value) => {
								setWeapon(value);
								setFieldValue('key', value);
							}}
						/>
						<Grid container spacing={1}>
							{characters.map(({ build, buildIndex }, index) => (
								<Grid key={index}>
									<CharacterImage character={charactersInfo[build.key]} />
									<PercentBar p={1 - buildIndex / build.weapon.length} />
								</Grid>
							))}
						</Grid>
					</WeaponForm>
				)}
			</Formik>
		</DialogWrapper>
	);
}
