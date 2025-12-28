import { charactersInfo } from '@/api/characters';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { type Build } from '@/src/types/data';
import { type IWeapon } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid } from '@mui/material';
import { useMemo } from 'react';
import { filter, pipe, prop, sortBy } from 'remeda';
import WeaponCharacterImage from '../../weapons/weaponCharacterImage';

export default function CharacterWeaponModal({ build, weapon }: { build: Build; weapon: IWeapon }) {
	const weapons = useAppSelector(prop('good', 'weapons'));
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const tierWeapons = useMemo(
		() =>
			pipe(
				weapons,
				filter(({ key }) => arrDeepIndex(build.weapon, key) !== -1),
				sortBy(({ key }) => arrDeepIndex(build.weapon, key)),
			),
		[weapons, build],
	);
	return (
		<DialogWrapper>
			<DialogTitle>Weapon for {charactersInfo[build.key].name}</DialogTitle>
			<DialogContent>
				{weapon && <WeaponCharacterImage weapon={weapon} />}
				<Grid container spacing={1} sx={{ overflowY: 'auto' }}>
					{tierWeapons.map((weapon, index) => (
						<Grid key={index}>
							<WeaponCharacterImage
								weapon={weapon}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									if (!confirm(`Give this weapon to ${charactersInfo[build.key].name}?`))
										return;
									dispatch(goodActions.giveWeapon([build.key, weapon]));
									closeModal();
								}}
							/>
						</Grid>
					))}
				</Grid>
			</DialogContent>
		</DialogWrapper>
	);
}
