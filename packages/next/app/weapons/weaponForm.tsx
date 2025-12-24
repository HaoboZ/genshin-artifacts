import { weaponsInfo } from '@/api/weapons';
import InputField from '@/components/fields/input';
import SwitchField from '@/components/fields/switch';
import { useModalControls } from '@/src/providers/modal/controls';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { type IWeapon } from '@/src/types/good';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	FormControlLabel,
	Stack,
	Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { Fragment, type ReactNode } from 'react';
import WeaponImage from './weaponImage';

export default function WeaponForm({
	deleteButton,
	children,
}: {
	deleteButton?: boolean;
	children?: ReactNode;
}) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();
	const { handleSubmit, values } = useFormikContext<IWeapon>();

	const weapon = weaponsInfo[values.key];

	return (
		<Fragment>
			<DialogContent>
				<Stack spacing={1}>
					{values.key && (
						<Stack spacing={1} direction='row'>
							<Stack>
								<WeaponImage hideStats weapon={values} />
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
				<Button
					disabled={!values.key}
					variant='contained'
					onClick={(e) => handleSubmit(e as any)}>
					Save
				</Button>
			</DialogActions>
		</Fragment>
	);
}
