'use client';
import Image from '@/components/image';
import Page from '@/components/page';
import data from '@/public/data.json';
import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';
import CharacterCard from './characterCard';

/*
click on weapon/artifact
	show inventory to select or add new equip, sorted by best option
	may go to artifact/weapon page with url param?
*/
export default function Characters() {
	const [element, setElement] = useState('');

	return (
		<Page title='Characters'>
			<ToggleButtonGroup
				exclusive
				value={element}
				onChange={(e, newElement) => setElement(newElement ?? '')}>
				<ToggleButton value=''>All</ToggleButton>
				{Object.values(data.elements).map((element) => (
					<ToggleButton key={element.key} value={element.key}>
						<Image alt={element.key} src={element.image} width={30} height={30} />
					</ToggleButton>
				))}
			</ToggleButtonGroup>
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
