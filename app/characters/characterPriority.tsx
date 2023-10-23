import Sortable from '@/components/sortable';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import type { CharacterKey } from '@/src/types/good';
import { Grid, Sheet, Typography } from '@mui/joy';
import { cloneDeep, difference } from 'lodash';
import { useState } from 'react';
import { useDidUpdate } from 'rooks';
import { charactersInfo } from './characterData';
import CharacterImage from './characterImage';

export default function CharacterPriority() {
	const priority = useAppSelector(({ main }) => main.priority);
	const dispatch = useAppDispatch();

	const [characters, setCharacters] = useState(
		() =>
			[
				difference(Object.keys(charactersInfo), ...priority),
				...cloneDeep(priority),
			] as CharacterKey[][],
	);

	useDidUpdate(() => {
		dispatch(mainActions.setPriority(characters.slice(1)));
	}, [characters]);

	return (
		<Sortable<CharacterKey>
			groups={characters}
			setGroups={setCharacters}
			renderItems={(list, ref) => (
				<Grid ref={ref} container spacing={1} minHeight={100}>
					{list}
				</Grid>
			)}
			renderItem={(key, props) => (
				<Grid {...props}>
					<CharacterImage character={charactersInfo[key]} size={50} />
				</Grid>
			)}>
			{([list1, ...lists]) => (
				<Grid container spacing={1}>
					<Grid xs={5}>
						<Sheet variant='outlined' sx={{ p: 1 }}>
							{list1}
						</Sheet>
					</Grid>
					<Grid container xs={7} alignContent='flex-start'>
						{lists.map((list, index) => (
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
		</Sortable>
	);
}
