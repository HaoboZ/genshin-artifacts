import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { DialogTitle, Grid, ModalClose, ModalDialog } from '@mui/joy';
import { sortByPath } from 'rambdax';
import { useMemo } from 'react';
import WeaponCharacterImage from '../../weapons/weaponCharacterImage';
import { weaponsInfo } from '../../weapons/weaponData';
import WeaponImage from '../../weapons/weaponImage';
import { charactersInfo } from '../characterData';

export default function CharacterWeaponModal(
	{ tier, weapon }: { tier: Tier; weapon: IWeapon },
	ref,
) {
	const weapons = useAppSelector(({ good }) => good.weapons);
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const weaponsSorted = useMemo(
		() =>
			sortByPath(
				'weaponTier',
				weapons
					.filter(({ key }) => arrDeepIndex(tier.weapon, key) !== -1)
					.map((weapon) => ({
						weapon,
						weaponTier: arrDeepIndex(tier.weapon, weapon.key) / tier.weapon.length,
					})),
			),
		[weapons, tier],
	);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>Weapon for {charactersInfo[tier.key].name}</DialogTitle>
			<ModalClose variant='outlined' />
			{weapon && <WeaponImage weapon={weaponsInfo[weapon.key]} />}
			<Grid container spacing={1} sx={{ overflowY: 'scroll' }}>
				{weaponsSorted.map(({ weapon, weaponTier }, index) => (
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
						<PercentBar p={1 - weaponTier} />
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
