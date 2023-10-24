import MultiSortable from '@/components/sortable/multi';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid, Sheet, Typography } from '@mui/joy';
import { clone, difference, omit } from 'rambdax';
import { useState } from 'react';
import { useDidUpdate } from 'rooks';
import { charactersInfo } from './characterData';
import CharacterImage from './characterImage';

export default function CharacterPriority() {
	const priority = useAppSelector(({ main }) => main.priority);
	const dispatch = useAppDispatch();

	const [characters, setCharacters] = useState(
		() =>
			({
				unSorted: difference(Object.keys(charactersInfo), Object.values(priority).flat()),
				...clone(priority),
			}) as Record<string, CharacterKey[]>,
	);

	useDidUpdate(() => {
		dispatch(mainActions.setPriority(omit('unSorted', characters)));
	}, [characters]);

	return (
		<MultiSortable<CharacterKey>
			groups={characters}
			setGroups={setCharacters}
			renderItems={(list, ref) => (
				<Grid ref={ref} container spacing={1} minHeight={100}>
					{list}
				</Grid>
			)}
			renderItem={(key, containerProps, handleProps) => (
				<Grid {...containerProps} {...handleProps}>
					<CharacterImage character={charactersInfo[key]} size={50} />
				</Grid>
			)}>
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
