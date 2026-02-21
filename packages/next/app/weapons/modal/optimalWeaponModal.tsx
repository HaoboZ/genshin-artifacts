import { builds } from '@/api/builds';
import { charactersInfo, useCharacters } from '@/api/characters';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import getFirst from '@/helpers/getFirst';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type Build } from '@/types/data';
import { type ICharacter, type IWeapon } from '@/types/good';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponImage from '../weaponImage';

type GiveWeapon = {
	weapon: IWeapon;
	tier: number;
	character: ICharacter & { build: Build };
	selected: boolean;
};

export default function OptimalWeaponModal() {
	const dispatch = useAppDispatch();
	const storedWeapons = useAppSelector(prop('good', 'weapons'));
	const { closeModal } = useModalControls();

	const characters = useCharacters({ owned: true });

	const [giveWeapons, setGiveWeapons] = useState(() => {
		const weapons = structuredClone(storedWeapons);
		const result: GiveWeapon[] = [];

		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			const tieredWeapons = pipe(
				weapons,
				map((weapon) => ({
					weapon,
					tier: arrDeepIndex(character.build.weapon, weapon.key),
				})),
				filter(({ tier }) => tier !== -1),
				sortBy(
					({ weapon }) => (weapon.level > 1 ? 0 : 1),
					prop('tier'),
					prop('weapon', 'refinement'),
				),
			);

			for (const { weapon, tier } of tieredWeapons) {
				if (weapon.location === character.key) break;
				const currentLocation = characters.findIndex(({ key }) => key === weapon.location);
				if (currentLocation !== -1 && currentLocation < i) continue;

				const currentWeapon = weapons.find(({ location }) => location === character.key);
				if (currentWeapon) {
					if (
						(currentWeapon.level !== 1 || weapon.level === 1) &&
						tier === arrDeepIndex(getFirst(builds[character.key]).weapon, currentWeapon.key)
					) {
						continue;
					}
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
							onClick={() => {
								setGiveWeapons((giveWeapons) => {
									giveWeapons[i].selected = !selected;
									return [...giveWeapons];
								});
							}}>
							<ListItemText>
								<Grid container spacing={1}>
									<Grid size='auto'>
										<WeaponImage weapon={weapon} />
									</Grid>
									<Grid size='grow'>
										<PercentBar p={1 - tier / character.build.weapon.length} />
									</Grid>
								</Grid>
							</ListItemText>
							<CharacterImage character={charactersInfo[character.key]} sx={{ ml: 1 }} />
						</ListItem>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						dispatch(goodActions.optimizeWeapons(giveWeapons.filter(prop('selected'))));
						closeModal();
					}}>
					Apply All
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
