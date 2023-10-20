'use client';
import Page from '@/components/page';
import PageSection from '@/components/page/section';
import useParamState from '@/src/hooks/useParamState';
import { data } from '@/src/resources/data';
import { Grid } from '@mui/material';
import CharacterCard from './characterCard';
import ElementFilter from './elementFilter';

export default function Characters() {
	const [element, setElement] = useParamState('element', '');

	return (
		<Page noSsr hideBack title='Characters'>
			<ElementFilter element={element} setElement={setElement} />
			<PageSection title={element || 'All'}>
				<Grid container spacing={2} py={1} justifyContent='center'>
					{Object.values(data.characters)
						.filter((character) => !element || character.element === element)
						.map((character) => (
							<Grid key={character.key} item>
								<CharacterCard character={character} />
							</Grid>
						))}
				</Grid>
			</PageSection>
		</Page>
	);
}
