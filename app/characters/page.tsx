'use client';
import Page from '@/components/page';
import data from '@/public/data.json';
import { Grid } from '@mui/material';
import { useState } from 'react';
import CharacterCard from './characterCard';
import ElementFilter from './elementFilter';

/*
click on weapon/artifact
	show inventory to select or add new equip, sorted by best option
	may go to artifact/weapon page with url param?
*/
export default function Characters() {
	const [element, setElement] = useState('');

	return (
		<Page noSsr title='Characters'>
			<ElementFilter element={element} setElement={setElement} />
			<Grid container spacing={2} justifyContent='center'>
				{Object.values(data.characters)
					.filter((character) => !element || character.element === element)
					.map((character) => (
						<Grid key={character.key} item>
							<CharacterCard character={character} />
						</Grid>
					))}
			</Grid>
		</Page>
	);
}
