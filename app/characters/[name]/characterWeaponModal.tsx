import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { DialogTitle, Grid, ModalClose, ModalDialog } from '@mui/joy';
import { useMemo } from 'react';
import { sortBy } from 'remeda';
import WeaponCharacterImage from '../../weapons/weaponCharacterImage';
import { charactersInfo } from '../characterData';

export default function CharacterWeaponModal(
	{ tier, weapon }: { tier: Tier; weapon: IWeapon },
	ref,
) {
	const weapons = useAppSelector(pget('good.weapons'));
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const weaponsSorted = useMemo(
		() =>
			sortBy(
				weapons.filter(({ key }) => arrDeepIndex(tier.weapon, key) !== -1),
				({ key }) => arrDeepIndex(tier.weapon, key) / tier.weapon.length,
			),
		[weapons, tier],
	);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Weapon for {charactersInfo[tier.key].name}</DialogTitle>
			<ModalClose variant='outlined' />
			{weapon && <WeaponCharacterImage weapon={weapon} />}
			<Grid container spacing={1} sx={{ overflowY: 'scroll' }}>
				{weaponsSorted.map((weapon, index) => (
					<Grid key={index}>
						<WeaponCharacterImage
							weapon={weapon}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (!confirm(`Give this weapon to ${charactersInfo[tier.key].name}?`))
									return;
								dispatch(goodActions.giveWeapon([tier.key, weapon]));
								closeModal();
							}}
						/>
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
