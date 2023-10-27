import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import { Tier } from '@/src/types/data';
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

export default function WeaponModal({ weapon }: { weapon: IWeapon }, ref) {
	const weapons = useAppSelector(pget('good.weapons'));
	const priority = useAppSelector(pget('main.priority'));

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
			filter(({ oldTierIndex }) => oldTierIndex !== -1),
			sortBy(({ tier }) => {
				const index = priorityIndex.indexOf(tier.key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [weapon]);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>{weaponsInfo[weapon.key].name}</DialogTitle>
			<ModalClose variant='outlined' />
			<WeaponActions weapon={weapon} />
			<WeaponCharacterImage weapon={weapon} />
			<Grid container spacing={1}>
				{characters.map(({ tier, tierIndex, oldWeapon, oldTierIndex }, index) => (
					<Grid key={index}>
						<CharacterImage character={charactersInfo[tier.key]}>
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
						<PercentBar p={tierIndex !== -1 ? 1 - tierIndex / tier.weapon.length : 0}>
							New %p
						</PercentBar>
						{oldWeapon && (
							<PercentBar
								p={oldTierIndex !== -1 ? 1 - oldTierIndex / tier.weapon.length : 0}>
								Old %p
							</PercentBar>
						)}
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
