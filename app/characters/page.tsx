'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { Grid } from '@mui/joy';
import CharacterCard from './characterCard';
import { charactersInfo } from './characterData';
import ElementFilter from './elementFilter';

export default function Characters() {
	const [element, setElement] = useParamState('element', null);

	return (
		<PageContainer noSsr>
			<PageTitle>Characters</PageTitle>
			<ElementFilter element={element} setElement={setElement} />
			<PageSection title={element || 'All'}>
				<Grid container spacing={2} py={1} justifyContent='center'>
					{Object.values(charactersInfo)
						.filter((character) => !element || character.element === element)
						.map((character) => (
							<Grid key={character.key}>
								<CharacterCard character={character} />
							</Grid>
						))}
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
