import { charactersInfo } from '@/api/characters';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IWeapon } from '@/src/types/good';
import { Button, ButtonGroup } from '@mui/joy';

export default function WeaponActions({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	return (
		<ButtonGroup>
			{weapon.location ? (
				<Button
					onClick={() => {
						if (!confirm(`Remove this weapon from ${charactersInfo[weapon.location].name}?`))
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
	);
}
