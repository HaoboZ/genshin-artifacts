import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PageLink from '@/components/page/link';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Build } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { DialogContent, DialogTitle, Grid2 } from '@mui/material';
import { pascalSnakeCase } from 'change-case';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import WeaponCharacterImage from '../weaponCharacterImage';
import WeaponImage from '../weaponImage';
import WeaponActions from './weaponActions';

export default function WeaponModal({ weapon }: { weapon: IWeapon }) {
	const dispatch = useAppDispatch();
	const weapons = useAppSelector(pget('good.weapons'));
	const priority = useAppSelector(pget('main.priority'));
	const { closeModal } = useModalControls();

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			builds,
			Object.values<Build>,
			filter(({ key }) => charactersInfo[key].weaponType === weaponsInfo[weapon.key].weaponType),
			map((build) => {
				const oldWeapon = weapons.find(({ location }) => location === build.key);

				return {
					build,
					buildIndex: arrDeepIndex(build.weapon, weapon.key),
					oldWeapon,
					oldTierIndex: oldWeapon && arrDeepIndex(build.weapon, oldWeapon.key),
				};
			}),
			filter(({ buildIndex }) => buildIndex !== -1),
			sortBy(({ build }) => {
				const index = priorityIndex.indexOf(build.key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [weapon]);

	return (
		<DialogWrapper>
			<DialogTitle>
				<PageLink
					href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(weapon.key)}`}
					target='_blank'
					underline='none'
					color='textPrimary'>
					{weaponsInfo[weapon.key].name}
				</PageLink>
			</DialogTitle>
			<DialogContent>
				<WeaponActions weapon={weapon} />
				<WeaponCharacterImage weapon={weapon} />
				<Grid2 container spacing={1}>
					{characters.map(({ build, buildIndex, oldWeapon, oldTierIndex }, index) => (
						<Grid2 key={index}>
							<CharacterImage
								character={charactersInfo[build.key]}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => {
									if (weapon.location === build.key) {
										alert(`Already equipped on ${charactersInfo[build.key].name}`);
										return;
									}
									if (!confirm(`Give this weapon to ${charactersInfo[build.key].name}?`))
										return;
									dispatch(goodActions.giveWeapon([build.key, weapon]));
									closeModal();
								}}>
								{oldWeapon && (
									<WeaponImage
										weapon={weaponsInfo[oldWeapon.key]}
										size={50}
										sx={{ position: 'absolute', bottom: 0, right: 0, border: 1 }}
									/>
								)}
							</CharacterImage>
							<PercentBar p={1 - buildIndex / build.weapon.length}>New %p</PercentBar>
							{oldWeapon && (
								<PercentBar
									p={oldTierIndex !== -1 ? 1 - oldTierIndex / build.weapon.length : 0}>
									Current %p
								</PercentBar>
							)}
						</Grid2>
					))}
				</Grid2>
			</DialogContent>
		</DialogWrapper>
	);
}
