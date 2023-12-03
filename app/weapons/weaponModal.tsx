import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { DialogTitle, Grid, ModalClose, ModalDialog } from '@mui/joy';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import WeaponActions from './weaponActions';
import WeaponCharacterImage from './weaponCharacterImage';
import { weaponsInfo } from './weaponData';
import WeaponImage from './weaponImage';

export default function WeaponModal({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const weapons = useAppSelector(pget('good.weapons'));
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			charactersTier,
			Object.values<Tier>,
			filter(({ key }) => charactersInfo[key].weaponType === weaponsInfo[weapon.key].weaponType),
			map((tier) => {
				const oldWeapon = weapons.find(({ location }) => location === tier.key);

				return {
					tier,
					tierIndex: arrDeepIndex(tier.weapon, weapon.key),
					oldWeapon,
					oldTierIndex: oldWeapon && arrDeepIndex(tier.weapon, oldWeapon.key),
				};
			}),
			filter(({ tierIndex }) => tierIndex !== -1),
			sortBy(({ tier }) => {
				const index = priorityIndex.indexOf(tier.key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [weapon]);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>{weaponsInfo[weapon.key].name}</DialogTitle>
				<ModalClose variant='outlined' />
				<WeaponActions weapon={weapon} />
				<WeaponCharacterImage weapon={weapon} />
				<Grid container spacing={1}>
					{characters.map(({ tier, tierIndex, oldWeapon, oldTierIndex }, index) => (
						<Grid key={index}>
							<CharacterImage
								character={charactersInfo[tier.key]}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									if (weapon.location === tier.key) {
										alert(`Already equipped on ${charactersInfo[tier.key].name}`);
										return;
									}
									if (!confirm(`Give this weapon to ${charactersInfo[tier.key].name}?`))
										return;
									dispatch(goodActions.giveWeapon([tier.key, weapon]));
									closeModal();
								}}>
								{oldWeapon && (
									<WeaponImage
										weapon={weaponsInfo[oldWeapon.key]}
										size={50}
										position='absolute'
										bottom={0}
										right={0}
										border={1}
									/>
								)}
							</CharacterImage>
							<PercentBar p={1 - tierIndex / tier.weapon.length}>New %p</PercentBar>
							{oldWeapon && (
								<PercentBar
									p={oldTierIndex !== -1 ? 1 - oldTierIndex / tier.weapon.length : 0}>
									Current %p
								</PercentBar>
							)}
						</Grid>
					))}
				</Grid>
			</ModalDialog>
		</ModalWrapper>
	);
}
