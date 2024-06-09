import { charactersInfo } from '@/api/characters';
import MultiSortable from '@/components/sortable/multi';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid, Sheet, Typography } from '@mui/joy';
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
				<Grid ref={ref} container spacing={1} minHeight={100}>
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
					<Grid xs={5}>
						<Sheet variant='outlined' sx={{ p: 1 }}>
							{unSorted}
						</Sheet>
					</Grid>
					<Grid container xs={7} alignContent='flex-start'>
						{Object.values(lists).map((list, index) => (
							<Grid key={index} xs={12}>
								<Sheet variant='outlined' sx={{ p: 1 }}>
									<Typography>Priority {index}</Typography>
									{list}
								</Sheet>
							</Grid>
						))}
					</Grid>
				</Grid>
			)}
		</MultiSortable>
	);
}
