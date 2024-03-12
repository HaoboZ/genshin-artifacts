import MultiSortable from '@/components/sortable/multi';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid, Input, Sheet, Typography } from '@mui/joy';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { difference, mapValues, omit } from 'remeda';
import { useDidUpdate } from 'rooks';
import { charactersInfo } from './characterData';
import CharacterImage from './characterImage';

export default function CharacterPriority({ editMode }: { editMode: boolean }) {
	const ownedCharacters = useAppSelector(pget('good.characters'));
	const priority = useAppSelector(pget('main.priority'));
	const dispatch = useAppDispatch();

	const [characters, setCharacters] = useState(
		() =>
			({
				unSorted: difference(Object.keys(charactersInfo), Object.values(priority).flat()),
				...structuredClone(priority),
			}) as Record<string, CharacterKey[]>,
	);

	const [search, setSearch] = useState('');

	const filteredCharacters = useMemo(() => {
		if (editMode || !search) return characters;
		const searchVal = search.toLowerCase();
		return mapValues(characters, (characters) =>
			characters.filter((key) => charactersInfo[key].name.toLowerCase().includes(searchVal)),
		);
	}, [characters, editMode, search]);

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
					{...containerProps}
					{...(editMode ? handleProps : { component: Link, href: `/characters/${key}` })}>
					<CharacterImage
						character={charactersInfo[key]}
						size={50}
						border={ownedCharacters.find((c) => key === c.key) ? 0 : 1}
						borderColor='red'
					/>
				</Grid>
			)}
			dependencies={[editMode, search]}>
			{({ unSorted, ...lists }) => (
				<Grid container spacing={1}>
					{!editMode && (
						<Grid xs={12}>
							<Input
								placeholder='Search'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</Grid>
					)}
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
