import { weaponsInfo } from '@/api/weapons';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { WeaponKey } from '@/src/types/good';
import {
	Autocomplete,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import WeaponImage from '../weaponImage';

export default function AddWeaponModal() {
	const dispatch = useAppDispatch();

	const [weapon, setWeapon] = useState<WeaponKey>(null);

	return (
		<DialogWrapper>
			<DialogTitle>Add Weapon</DialogTitle>
			<DialogContent>
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
