import { charactersInfo } from '@/api/characters';
import MultiSortable from '@/components/sortable/multi';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid, Paper, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { filter, isIncludedIn, isNot, mapValues, omit, prop } from 'remeda';
import CharacterTierImage from './characterTierImage';

export default function CharacterPriority({
	editMode,
	element,
	weaponType,
	rarity,
	owned,
	search,
}: {
	editMode: boolean;
	element: string;
	weaponType: string;
	rarity: number;
	owned: boolean;
	search: string;
}) {
	const good = useAppSelector(prop('good'));
	const priority = useAppSelector(prop('main', 'priority'));
	const dispatch = useAppDispatch();

	const [characters, setCharacters] = useState(
		() =>
			({
				unSorted: filter(
					Object.keys(charactersInfo),
					isNot(isIncludedIn(Object.values(priority).flat())),
				),
				...structuredClone(priority),
			}) as Record<string, CharacterKey[]>,
	);

	const filteredCharacters = useMemo(() => {
		if (editMode) return characters;
		const searchVal = search.toLowerCase();
		return mapValues(characters, (characters) =>
			characters.filter((key) => {
				const character = charactersInfo[key];
				return (
					(!element || character.element === element) &&
					(!weaponType || character.weaponType === weaponType) &&
					(!rarity || character.rarity === rarity) &&
					(!owned || good.characters.find((c) => c.key === key)) &&
					(!searchVal || character.name.toLowerCase().includes(searchVal))
				);
			}),
		);
	}, [editMode, characters, search, element, weaponType, rarity, owned, good.characters]);

	useEffect(() => {
		dispatch(mainActions.setPriority(omit(characters, ['unSorted'])));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [characters]);

	return (
		<MultiSortable<CharacterKey>
			groups={filteredCharacters}
			setGroups={setCharacters}
			renderItems={(list, ref) => (
				<Grid ref={ref} container spacing={1} sx={{ minHeight: 100 }}>
					{list}
				</Grid>
			)}
			renderItem={(key, containerProps, handleProps) => (
				<Grid
					sx={{ textDecoration: 'none' }}
					{...containerProps}
					{...(editMode ? handleProps : { component: Link, href: `/characters/${key}` })}>
					<CharacterTierImage good={good} characterKey={key} />
				</Grid>
			)}
			dependencies={[editMode]}>
			{({ unSorted, ...lists }) => (
				<Grid container spacing={1}>
					<Grid size={5}>
						<Paper variant='outlined' sx={{ p: 1 }}>
							{unSorted}
						</Paper>
					</Grid>
					<Grid container size={7} sx={{ alignContent: 'flex-start' }}>
						{Object.values(lists).map((list, index) => (
							<Grid key={index} size={12}>
								<Paper variant='outlined' sx={{ p: 1 }}>
									<Typography>Priority {index}</Typography>
									{list}
								</Paper>
							</Grid>
						))}
					</Grid>
				</Grid>
			)}
		</MultiSortable>
	);
}
