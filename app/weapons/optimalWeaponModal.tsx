import PercentBar from '@/components/percentBar';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	List,
	ListItem,
	ListItemContent,
	ModalClose,
	ModalDialog,
} from '@mui/joy';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import arrDeepIndex from '../../src/helpers/arrDeepIndex';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { weaponsInfo } from './weaponData';
import WeaponImage from './weaponImage';

export default function OptimalWeaponModal() {
	const dispatch = useAppDispatch();
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const storedWeapons = useAppSelector(pget('good.weapons'));
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const givenWeapons = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		const characters = pipe(
			charactersTier,
			Object.values<Tier>,
			filter(({ key }) => ownedCharacters.findIndex((c) => key === c.key) !== -1),
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);

		const weapons = structuredClone(storedWeapons);
		const result: { weapon: IWeapon; tier: number; character: Tier }[] = [];
		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];

			const tieredWeapons = pipe(
				weapons,
				map((weapon) => ({ weapon, tier: arrDeepIndex(character.weapon, weapon.key) })),
				filter(({ tier }) => tier !== -1),
				sortBy(({ tier }) => tier),
			);

			for (const { weapon, tier } of tieredWeapons) {
				if (weapon.location === character.key) break;
				const currentLocation = characters.findIndex(({ key }) => key === weapon.location);
				if (currentLocation !== -1 && currentLocation < i) continue;

				const currentWeapon = weapons.find(({ location }) => location === character.key);
				if (currentWeapon) currentWeapon.location = '';
				weapon.location = character.key;
				result.push({ weapon, tier, character });
				break;
			}
		}
		return result;
	}, []);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Weapons</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{givenWeapons.map(({ weapon, tier, character }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<Grid container spacing={1}>
										<Grid xs='auto'>
											<WeaponImage weapon={weaponsInfo[weapon.key]} />
										</Grid>
										<Grid xs>
											<PercentBar p={1 - tier / character.weapon.length}>
												New %p
											</PercentBar>
										</Grid>
									</Grid>
								</ListItemContent>
								<CharacterImage character={charactersInfo[character.key]} />
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							dispatch(goodActions.optimizeWeapons(givenWeapons));
							closeModal();
						}}>
						Apply All
					</Button>
				</DialogActions>
			</ModalDialog>
		</ModalWrapper>
	);
}
