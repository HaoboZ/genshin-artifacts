import { charactersInfo } from '@/api/characters';
import MultiSortable from '@/components/sortable/multi';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid2, Paper, Typography } from '@mui/material';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { filter, isIncludedIn, isNot, mapValues, omit } from 'remeda';
import { useDidUpdate } from 'rooks';
import CharacterTierImage from './characterTierImage';

export default function CharacterPriority({
	editMode,
	element,
	weaponType,
	owned,
	search,
}: {
	editMode: boolean;
	element: string;
	weaponType: string;
	owned: boolean;
	search: string;
}) {
	const good = useAppSelector(pget('good'));
	const priority = useAppSelector(pget('main.priority'));
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
					(!owned || good.characters.find((c) => c.key === key)) &&
					(!searchVal || character.name.toLowerCase().includes(searchVal))
				);
			}),
		);
	}, [characters, editMode, element, weaponType, owned, search]);

	useDidUpdate(() => {
		dispatch(mainActions.setPriority(omit(characters, ['unSorted'])));
	}, [characters]);

	return (
		<MultiSortable<CharacterKey>
			groups={filteredCharacters}
			setGroups={setCharacters}
			renderItems={(list, ref) => (
				<Grid2 ref={ref} container spacing={1} sx={{ minHeight: 100 }}>
					{list}
				</Grid2>
			)}
			renderItem={(key, containerProps, handleProps) => (
				<Grid2
					sx={{ textDecoration: 'none' }}
					{...containerProps}
					{...(editMode ? handleProps : { component: Link, href: `/characters/${key}` })}>
					<CharacterTierImage good={good} characterKey={key} />
				</Grid2>
			)}
			dependencies={[editMode]}>
			{({ unSorted, ...lists }) => (
				<Grid2 container spacing={1}>
					<Grid2 size={5}>
						<Paper variant='outlined' sx={{ p: 1 }}>
							{unSorted}
						</Paper>
					</Grid2>
					<Grid2 container size={7} sx={{ alignContent: 'flex-start' }}>
						{Object.values(lists).map((list, index) => (
							<Grid2 key={index} size={12}>
								<Paper variant='outlined' sx={{ p: 1 }}>
									<Typography>Priority {index}</Typography>
									{list}
								</Paper>
							</Grid2>
						))}
					</Grid2>
				</Grid2>
			)}
		</MultiSortable>
	);
}
