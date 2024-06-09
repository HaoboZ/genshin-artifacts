'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { Checkbox, FormControl, FormLabel, Input, Switch } from '@mui/joy';
import { useState } from 'react';
import WeaponTypeFilter from '../weapons/weaponTypeFilter';
import CharacterPriority from './characterPriority';
import ElementFilter from './elementFilter';

export default function Characters() {
	const [element, setElement] = useParamState('element', null);
	const [weaponType, setWeaponType] = useParamState('weapon', null);

	const [search, setSearch] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [owned, setOwned] = useState(false);

	return (
		<PageContainer noSsr>
			<PageTitle>Characters</PageTitle>
			<ElementFilter element={element} setElement={setElement} />
			<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
			<Checkbox
				label='Owned'
				checked={owned}
				onChange={({ target }) => setOwned(target.checked)}
				sx={{ mt: 1 }}
			/>
			<Input
				sx={{ my: 1 }}
				placeholder='Search'
				value={search}
				onChange={({ target }) => setSearch(target.value)}
			/>
			<PageSection
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
				<CharacterPriority
					editMode={editMode}
					element={element}
					weaponType={weaponType}
					owned={owned}
					search={search.toLowerCase()}
				/>
			</PageSection>
		</PageContainer>
	);
}
