import { weaponsInfo } from '@/api/weapons';
import InputField from '@/components/form/inputField';
import SwitchField from '@/components/form/switchField';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type IWeapon } from '@/types/good';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	FormControlLabel,
	Stack,
	Typography,
} from '@mui/material';
import { Fragment, type ReactNode } from 'react';
import { type SubmitHandler, useFormContext, useWatch } from 'react-hook-form';
import WeaponImage from './weaponImage';

export default function WeaponForm({
	deleteButton,
	children,
	onSubmit,
}: {
	deleteButton?: boolean;
	children?: ReactNode;
	onSubmit: SubmitHandler<IWeapon>;
}) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();
	const { control, handleSubmit } = useFormContext<IWeapon>();
	const values = useWatch({ control });

	const weapon = weaponsInfo[values.key];

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogContent>
				<Stack spacing={1}>
					{values.key && (
						<Stack spacing={1} direction='row'>
							<Stack>
								<WeaponImage hideStats weapon={values as IWeapon} />
								<FormControlLabel control={<SwitchField name='lock' />} label='Locked' />
							</Stack>
							<Box>
								<InputField name='level' label='Level' />
								<InputField name='refinement' label='Refinement' />
							</Box>
						</Stack>
					)}
					{weapon && (
						<Fragment>
							<Typography>
								<b>ATK:</b> {weapon.atk}
							</Typography>
							<Typography>
								<b>Ascension:</b> {weapon.stat}
							</Typography>
							<Typography>
								<b>Ability:</b> {weapon.ability}
							</Typography>
						</Fragment>
					)}
					{children}
				</Stack>
			</DialogContent>
			<DialogActions>
				{deleteButton && (
					<Button
						variant='contained'
						color='error'
						onClick={() => {
							if (!confirm('Delete this weapon?')) return;
							dispatch(goodActions.deleteWeapon(values.id));
							closeModal();
						}}>
						Delete
					</Button>
				)}
				<Button type='submit' disabled={!values.key} variant='contained'>
					Save
				</Button>
			</DialogActions>
		</form>
	);
}
