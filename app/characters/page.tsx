'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { useAppSelector } from '@/src/store/hooks';
import { Grid } from '@mui/joy';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import CharacterCard from './characterCard';
import { charactersInfo } from './characterData';
import CharacterPriority from './characterPriority';
import ElementFilter from './elementFilter';

export default function Characters() {
	const priority = useAppSelector(({ main }) => main.priority);

	const [element, setElement] = useParamState('element', null);

	const characters = useMemo(() => {
		const priorityIndex = priority.flat();
		return sortBy(Object.values(charactersInfo), ({ key }) => {
			const index = priorityIndex.indexOf(key);
			return index === -1 ? Infinity : index;
		});
	}, [priority]);

	return (
		<PageContainer noSsr>
			<PageTitle>Characters</PageTitle>
			<ElementFilter element={element} setElement={setElement} />
			<PageSection title={element || 'All'}>
				{element ? (
					<Grid container spacing={1} justifyContent='center'>
						{characters
							.filter((character) => character.element === element)
							.map((character) => (
								<Grid key={character.key}>
									<CharacterCard character={character} />
								</Grid>
							))}
					</Grid>
				) : (
					<CharacterPriority />
				)}
			</PageSection>
		</PageContainer>
	);
}
