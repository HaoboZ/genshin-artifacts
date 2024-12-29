import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { WeaponKey } from '@/src/types/good';
import {
	Autocomplete,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid2,
	Stack,
	TextField,
} from '@mui/material';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponImage from '../weaponImage';

export default function AddWeaponModal() {
	const dispatch = useAppDispatch();
	const priority = useAppSelector(pget('main.priority'));

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
	}, [weapon]);

	return (
		<DialogWrapper>
			<DialogTitle>Add Weapon</DialogTitle>
			<DialogContent>
				<Stack spacing={1}>
					<Autocomplete
						fullWidth
						autoHighlight
						sx={{ pt: 1 }}
						renderInput={(params) => <TextField {...params} label='Select Weapon' />}
						options={Object.keys(weaponsInfo)}
						getOptionLabel={(key) => weaponsInfo[key].name}
						value={weapon as any}
						onChange={(e, value) => setWeapon(value as any as WeaponKey)}
					/>
					{weapon && <WeaponImage weapon={weaponsInfo[weapon]} />}
					<Grid2 container spacing={1}>
						{characters.map(({ build, buildIndex }, index) => (
							<Grid2 key={index}>
								<CharacterImage character={charactersInfo[build.key]} />
								<PercentBar p={1 - buildIndex / build.weapon.length} />
							</Grid2>
						))}
					</Grid2>
				</Stack>
			</DialogContent>
			{weapon && (
				<DialogActions>
					<Button
						variant='contained'
						onClick={() => {
							dispatch(
								goodActions.addWeapon({
									id: nanoid(),
									key: weapon,
									level: 90,
									ascension: 6,
									refinement: 5,
									location: '',
									lock: true,
								}),
							);
						}}>
						Confirm
					</Button>
				</DialogActions>
			)}
		</DialogWrapper>
	);
}
