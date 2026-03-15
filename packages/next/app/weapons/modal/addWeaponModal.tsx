import { buildsList } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type IWeapon, type WeaponKey } from '@/types/good';
import { Autocomplete, DialogTitle, Grid, TextField } from '@mui/material';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponForm from '../weaponForm';

export default function AddWeaponModal() {
	const dispatch = useAppDispatch();
	const priority = useAppSelector(prop('main', 'priority'));
	const { closeModal } = useModalControls();
	const methods = useForm<IWeapon>({
		defaultValues: {
			key: '',
			level: 1,
			ascension: 0,
			refinement: 1,
			location: '',
			lock: false,
		},
	});

	const weapon = useWatch({ control: methods.control, name: 'key' }) as WeaponKey;

	const characters = useMemo(() => {
		if (!weapon) return [];
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			buildsList,
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
			<FormProvider {...methods}>
				<WeaponForm
					onSubmit={(formWeapon) => {
						formWeapon.id = nanoid();
						dispatch(goodActions.addWeapon(formWeapon));
						closeModal();
					}}>
					<Autocomplete
						fullWidth
						autoHighlight
						sx={{ pt: 1 }}
						renderInput={(params) => <TextField {...params} label='Select Weapon' />}
						options={Object.keys(weaponsInfo)}
						getOptionLabel={(key) => weaponsInfo[key]?.name ?? ''}
						value={weapon as any}
						onChange={(_, value) => {
							(methods.setValue as any)('key', value ?? '');
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
			</FormProvider>
		</DialogWrapper>
	);
}
