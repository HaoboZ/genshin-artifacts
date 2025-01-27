'use client';
import type { WeaponType } from '@/api/weapons';
import { useWeapons } from '@/api/weapons';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { Lock as LockIcon } from '@mui/icons-material';
import { Grid2, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import RarityFilter from '../characters/rarityFilter';
import AddWeaponModal from './modal/addWeaponModal';
import OptimalWeaponModal from './modal/optimalWeaponModal';
import WeaponModal from './modal/weaponModal';
import WeaponCharacterImage from './weaponCharacterImage';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const { showModal } = useModal();

	const [type, setType] = useParamState<WeaponType>('type', null);
	const [rarity, setRarity] = useParamState('rarity', null);

	const [search, setSearch] = useState('');

	const weapons = useWeapons({ type, rarity: +rarity, search });

	return (
		<PageContainer>
			<PageTitle>Weapons</PageTitle>
			<Stack direction='row' spacing={2}>
				<WeaponTypeFilter weaponType={type} setWeaponType={setType} />
				<RarityFilter rarity={rarity} setRarity={setRarity} />
			</Stack>
			<PageSection
				title={type || 'All'}
				actions={[
					{ name: 'Add', onClick: () => showModal(AddWeaponModal) },
					{ name: 'Optimize', onClick: () => showModal(OptimalWeaponModal) },
				]}>
				<Grid2 container spacing={1}>
					<Grid2 size={12}>
						<TextField
							placeholder='Search'
							value={search}
							onChange={({ target }) => setSearch(target.value)}
						/>
					</Grid2>
					{weapons.map((weapon) => (
						<Grid2 key={weapon.id}>
							<WeaponCharacterImage
								weapon={weapon}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => showModal(WeaponModal, { props: { weapon } })}>
								{weapon?.lock && (
									<LockIcon
										sx={{
											position: 'absolute',
											top: 0,
											left: 0,
											color: 'white',
										}}
									/>
								)}
							</WeaponCharacterImage>
						</Grid2>
					))}
				</Grid2>
			</PageSection>
		</PageContainer>
	);
}
