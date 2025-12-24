import { weeklyCount, weeklyInfo } from '@/api/talents';
import ContextMenu from '@/components/contextMenu';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { type DCharacter } from '@/src/types/data';
import { type ICharacter } from '@/src/types/good';
import { Box, MenuItem, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { clamp, indexBy, prop } from 'remeda';
import CharacterImage from '../characters/characterImage';

export default function TalentBooksCharacter({
	character,
}: {
	character: DCharacter & ICharacter;
}) {
	const currentMaterials = useAppSelector(prop('good', 'materials'));
	const dispatch = useAppDispatch();

	const weeklyItems = useMemo(() => indexBy(weeklyInfo.flatMap(prop('items')), prop('key')), []);

	const increaseSkill = (type) => {
		dispatch(
			goodActions.editCharacter({
				key: character.key,
				talent: { [type]: clamp(character.talent[type] + 1, { min: 1, max: 10 }) },
			}),
		);
		const count = weeklyCount[character.talent[type]];
		if (count) {
			dispatch(
				goodActions.setWeeklyMaterial({
					key: character.weeklyMaterial,
					amount:
						currentMaterials[character.weeklyMaterial] - weeklyCount[character.talent[type]],
				}),
			);
		}
	};

	return (
		<ContextMenu
			disabled={!character.level}
			menuContent={(closeMenu) =>
				[
					character.talent.auto < 10 && (
						<MenuItem
							key='auto'
							onClick={() => {
								increaseSkill('auto');
								closeMenu();
							}}>
							Increase Auto
						</MenuItem>
					),
					character.talent.skill < 10 && (
						<MenuItem
							key='skill'
							onClick={() => {
								increaseSkill('skill');
								closeMenu();
							}}>
							Increase Skill
						</MenuItem>
					),
					character.talent.burst < 10 && (
						<MenuItem
							key='burst'
							onClick={() => {
								increaseSkill('burst');
								closeMenu();
							}}>
							Increase Burst
						</MenuItem>
					),
				].filter(Boolean)
			}>
			<Box
				component={Link}
				href={`/characters/${character.key}`}
				sx={{ color: 'inherit', textDecoration: 'none' }}>
				<CharacterImage
					character={character}
					size={75}
					sx={{ border: character.level ? 0 : 2, borderColor: 'red' }}>
					<Image
						alt={character.weeklyMaterial}
						src={weeklyItems[character.weeklyMaterial]?.image}
						width={30}
						height={30}
						style={{ position: 'absolute', bottom: 0, right: 0, border: 1 }}
						className='rarity5'
					/>
				</CharacterImage>
				<Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
					<Typography>{(character.level && character.talent?.auto) ?? 0}</Typography>
					<Typography>{(character.level && character.talent?.skill) ?? 0}</Typography>
					<Typography>{(character.level && character.talent?.burst) ?? 0}</Typography>
				</Box>
			</Box>
		</ContextMenu>
	);
}
