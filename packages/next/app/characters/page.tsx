'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { Checkbox, FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import { useState } from 'react';
import WeaponTypeFilter from '../weapons/weaponTypeFilter';
import CharacterPriority from './characterPriority';
import ElementFilter from './elementFilter';
import RarityFilter from './rarityFilter';

export default function Characters() {
	const [element, setElement] = useParamState('element', null);
	const [weaponType, setWeaponType] = useParamState('weapon', null);
	const [rarity, setRarity] = useParamState('rarity', null);

	const [search, setSearch] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [owned, setOwned] = useState(false);

	return (
		<PageContainer>
			<PageTitle>Characters</PageTitle>
			<Stack direction='row' spacing={2}>
				<ElementFilter element={element} setElement={setElement} />
				<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
				<RarityFilter hide3 rarity={rarity} setRarity={setRarity} />
			</Stack>
			<FormControlLabel
				control={
					<Checkbox checked={owned} onChange={({ target }) => setOwned(target.checked)} />
				}
				label='Owned'
			/>
			<TextField
				label='Search'
				value={search}
				onChange={({ target }) => setSearch(target.value)}
			/>
			<PageSection
				actions={
					<FormControlLabel
						control={
							<Switch
								checked={editMode}
								onChange={({ target }) => setEditMode(target.checked)}
							/>
						}
						label='Edit Mode'
						sx={{ ml: 0 }}
					/>
				}>
				<CharacterPriority
					editMode={editMode}
					element={element}
					weaponType={weaponType}
					rarity={+rarity}
					owned={owned}
					search={search.toLowerCase()}
				/>
			</PageSection>
		</PageContainer>
	);
}
