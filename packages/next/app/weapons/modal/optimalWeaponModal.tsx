import { builds } from '@/api/builds';
import { charactersInfo, useCharacters } from '@/api/characters';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid2,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponImage from '../weaponImage';

export default function OptimalWeaponModal() {
	const dispatch = useAppDispatch();
	const storedWeapons = useAppSelector(pget('good.weapons'));
	const { closeModal } = useModalControls();

	const characters = useCharacters({ owned: true });

	const [giveWeapons, setGiveWeapons] = useState(() => {
		const weapons = structuredClone(storedWeapons);
		const result: { weapon: IWeapon; tier: number; character: Build; selected: boolean }[] = [];
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
				if (weapon.lock) continue;
				if (weapon.location === character.key) break;
				const currentLocation = characters.findIndex(({ key }) => key === weapon.location);
				if (currentLocation !== -1 && currentLocation < i) continue;

				const currentWeapon = weapons.find(({ location }) => location === character.key);
				if (currentWeapon) {
					if (currentWeapon.lock) break;
					if (tier === arrDeepIndex(builds[character.key].weapon, currentWeapon.key)) continue;
					currentWeapon.location = '';
				}
				weapon.location = character.key;
				result.push({ weapon, tier, character, selected: true });
				break;
			}
		}
		return result;
	});

	return (
		<DialogWrapper>
			<DialogTitle>Weapons</DialogTitle>
			<DialogContent>
				<List>
					{giveWeapons.map(({ weapon, tier, character, selected }, i) => (
						<ListItem
							key={i}
							sx={{
								':hover': { cursor: 'pointer' },
								'border': 1,
								'borderColor': selected ? 'blue' : 'rgba(127,127,127,.3)',
								'borderRadius': 3,
							}}
							onClick={() =>
								setGiveWeapons((giveWeapons) => {
									giveWeapons[i].selected = !selected;
									return [...giveWeapons];
								})
							}>
							<ListItemText>
								<Grid2 container spacing={1}>
									<Grid2 size='auto'>
										<WeaponImage weapon={weapon} />
									</Grid2>
									<Grid2 size='grow'>
										<PercentBar p={1 - tier / character.weapon.length} />
									</Grid2>
								</Grid2>
							</ListItemText>
							<CharacterImage character={charactersInfo[character.key]} />
						</ListItem>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						dispatch(goodActions.optimizeWeapons(giveWeapons.filter(pget('selected'))));
						closeModal();
					}}>
					Apply All
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
