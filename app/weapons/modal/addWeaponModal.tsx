import { weaponsInfo } from '@/api/weapons';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { WeaponKey } from '@/src/types/good';
import {
	Autocomplete,
	Button,
	DialogTitle,
	FormControl,
	FormLabel,
	ModalClose,
	ModalDialog,
} from '@mui/joy';
import { nanoid } from 'nanoid';
import { Fragment, useState } from 'react';
import WeaponImage from '../weaponImage';

export default function AddWeaponModal() {
	const dispatch = useAppDispatch();

	const [weapon, setWeapon] = useState<WeaponKey>(null);

	return (
		<ModalWrapper>
			<ModalDialog>
				<DialogTitle>Add Weapon</DialogTitle>
				<ModalClose variant='outlined' />
				<FormControl>
					<FormLabel>Weapon</FormLabel>
					<Autocomplete
						autoHighlight
						placeholder='Select Weapon'
						options={Object.keys(weaponsInfo)}
						getOptionLabel={(key) => weaponsInfo[key].name}
						value={weapon as any}
						onChange={(e, value) => setWeapon(value as any as WeaponKey)}
					/>
				</FormControl>
				{weapon && (
					<Fragment>
						<WeaponImage weapon={weaponsInfo[weapon]} />
						<Button
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
					</Fragment>
				)}
			</ModalDialog>
		</ModalWrapper>
	);
}
