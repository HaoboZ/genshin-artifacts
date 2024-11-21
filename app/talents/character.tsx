import { weeklyInfo } from '@/api/talents';
import ContextMenu from '@/components/contextMenu';
import pget from '@/src/helpers/pget';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { DCharacter } from '@/src/types/data';
import type { ICharacter } from '@/src/types/good';
import { Box, MenuItem, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { clamp, indexBy } from 'remeda';
import CharacterImage from '../characters/characterImage';

export default function BooksCharacter({ character }: { character: DCharacter & ICharacter }) {
	const dispatch = useAppDispatch();

	const weeklyItems = useMemo(() => indexBy(weeklyInfo.flatMap(pget('items')), pget('name')), []);

	const increaseSkill = (type) =>
		dispatch(
			goodActions.editSkills({
				character: character.key,
				talent: {
					[type]: clamp((character.talent?.[type] ?? 0) + 1, { min: 1, max: 10 }),
				},
			}),
		);

	return (
		<ContextMenu
			menuContent={(closeMenu) => [
				<MenuItem
					key='auto'
					onClick={() => {
						increaseSkill('auto');
						closeMenu();
					}}>
					Increase Auto
				</MenuItem>,
				<MenuItem
					key='skill'
					onClick={() => {
						increaseSkill('skill');
						closeMenu();
					}}>
					Increase Skill
				</MenuItem>,
				<MenuItem
					key='burst'
					onClick={() => {
						increaseSkill('burst');
						closeMenu();
					}}>
					Increase Burst
				</MenuItem>,
			]}>
			<Box
				component={Link}
				href={`/characters/${character.key}`}
				sx={{ color: 'inherit', textDecoration: 'none', mr: 1 }}>
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
					<Typography>{character.talent?.auto ?? 0}</Typography>
					<Typography>{character.talent?.skill ?? 0}</Typography>
					<Typography>{character.talent?.burst ?? 0}</Typography>
				</Box>
			</Box>
		</ContextMenu>
	);
}
