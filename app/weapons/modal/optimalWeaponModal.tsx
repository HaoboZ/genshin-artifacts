import { builds } from '@/api/builds';
import { charactersInfo, useCharacters } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
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
import CharacterImage from '../../characters/characterImage';
import WeaponImage from '../weaponImage';

export default function OptimalWeaponModal() {
	const dispatch = useAppDispatch();
	const storedWeapons = useAppSelector(pget('good.weapons'));
	const { closeModal } = useModalControls();

	const characters = useCharacters({ owned: true });

	const givenWeapons = useMemo(() => {
		const weapons = structuredClone(storedWeapons);
		const result: { weapon: IWeapon; tier: number; character: Build }[] = [];
		for (let i = 0; i < characters.length; i++) {
			const character = builds[characters[i].key];
			const tieredWeapons = pipe(
				weapons,
				map((weapon) => ({
					weapon,
					tier: arrDeepIndex(builds[character.key].weapon, weapon.key),
				})),
				filter(({ tier }) => tier !== -1),
				sortBy(pget('tier')),
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
	}, [storedWeapons, characters]);

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
