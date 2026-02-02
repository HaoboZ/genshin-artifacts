'use client';
import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import useParamState from '@/hooks/useParamState';
import { Checkbox, Container, FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import { useState } from 'react';
import WeaponTypeFilter from '../weapons/weaponTypeFilter';
import CharacterPriority from './characterPriority';
import ElementFilter from './elementFilter';
import RarityFilter from './rarityFilter';

export default function Characters() {
	const [element, setElement] = useParamState('element', null);
	const [weaponType, setWeaponType] = useParamState('weapon', null);
	const [rarity, setRarity] = useParamState('rarity', 0);

	const [search, setSearch] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [owned, setOwned] = useState(false);

	return (
		<Container>
			<PageTitle>Characters</PageTitle>
			<Stack direction='row' spacing={2}>
				<ElementFilter element={element} setElement={setElement} />
				<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
				<RarityFilter hide3 rarity={rarity} setRarity={setRarity} />
			</Stack>
			<FormControlLabel
				control={<Checkbox checked={owned} onChange={(_, checked) => setOwned(checked)} />}
				label='Owned'
			/>
			<TextField label='Search' value={search} onChange={(e) => setSearch(e.target.value)} />
			<PageSection
				actions={
					<FormControlLabel
						control={
							<Switch
								checked={editMode}
								disabled={Boolean(element || weaponType || rarity || search)}
								onChange={(_, checked) => setEditMode(checked)}
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
		</Container>
	);
}
