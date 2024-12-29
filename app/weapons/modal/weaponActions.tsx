import { charactersInfo } from '@/api/characters';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IWeapon } from '@/src/types/good';
import { Box, Button, ButtonGroup, FormControlLabel, Switch } from '@mui/material';

export default function WeaponActions({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	return (
		<Box>
			<ButtonGroup>
				{weapon.location ? (
					<Button
						onClick={() => {
							if (
								!confirm(`Remove this weapon from ${charactersInfo[weapon.location].name}?`)
							)
								return;
							dispatch(goodActions.removeWeapon(weapon));
							closeModal();
						}}>
						Remove
					</Button>
				) : null}
				<Button
					onClick={() => {
						if (!confirm('Delete this weapon?')) return;
						dispatch(goodActions.deleteWeapon(weapon));
						closeModal();
					}}>
					Delete
				</Button>
			</ButtonGroup>
			<FormControlLabel
				control={
					<Switch
						checked={weapon.lock}
						onChange={({ target }) => {
							weapon.lock = target.checked;
							dispatch(goodActions.editWeapon(weapon));
						}}
					/>
				}
				label='Locked'
				sx={{ ml: 1 }}
			/>
		</Box>
	);
}
