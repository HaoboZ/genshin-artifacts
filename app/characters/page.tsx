'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import useParamState from '@/src/hooks/useParamState';
import { useAppSelector } from '@/src/store/hooks';
import { FormControl, FormLabel, Grid, Switch } from '@mui/joy';
import { useMemo, useState } from 'react';
import { sortBy } from 'remeda';
import WeaponTypeFilter from '../weapons/weaponTypeFilter';
import CharacterCard from './characterCard';
import { charactersInfo } from './characterData';
import CharacterPriority from './characterPriority';
import ElementsFilter from './elementsFilter';

export default function Characters() {
	const priority = useAppSelector(pget('main.priority'));

	const [element, setElement] = useParamState('element', null);
	const [weaponType, setWeaponType] = useParamState('weapon', null);
	const [editMode, setEditMode] = useState(false);

	const characters = useMemo(() => {
		if (!element && !weaponType) return [];
		const priorityIndex = Object.values(priority).flat();
		return sortBy(Object.values(charactersInfo), ({ key }) => {
			const index = priorityIndex.indexOf(key);
			return index === -1 ? Infinity : index;
		}).filter(
			(character) =>
				(!element || character.element === element) &&
				(!weaponType || character.weaponType === weaponType),
		);
	}, [priority, element, weaponType]);

	return (
		<PageContainer noSsr>
			<PageTitle>Characters</PageTitle>
			<ElementsFilter element={element} setElement={setElement} />
			<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
			{!element && !weaponType ? (
				<PageSection
					title='All'
					actions={
						<FormControl orientation='horizontal'>
							<FormLabel>Edit Mode</FormLabel>
							<Switch
								size='lg'
								sx={{ ml: 0 }}
								checked={editMode}
								onChange={({ target }) => setEditMode(target.checked)}
							/>
						</FormControl>
					}>
					<CharacterPriority editMode={editMode} />
				</PageSection>
			) : (
				<PageSection
					title={[element && `Element: ${element}`, weaponType && `Weapon: ${weaponType}`]
						.filter(Boolean)
						.join(', ')}>
					<Grid container spacing={1} justifyContent='center'>
						{characters.map((character) => (
							<Grid key={character.key}>
								<CharacterCard character={character} />
							</Grid>
						))}
					</Grid>
				</PageSection>
			)}
		</PageContainer>
	);
}
