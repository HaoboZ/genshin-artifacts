'use client';
import { useWeapons, type WeaponType } from '@/api/weapons';
import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { Lock as LockIcon } from '@mui/icons-material';
import { Container, Grid, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import RarityFilter from '../characters/rarityFilter';
import WeaponCharacterImage from './weaponCharacterImage';
import WeaponTypeFilter from './weaponTypeFilter';

const AddWeaponModal = dynamicModal(() => import('./modal/addWeaponModal'));
const EditWeaponModal = dynamicModal(() => import('./modal/editWeaponModal'));
const OptimalWeaponModal = dynamicModal(() => import('./modal/optimalWeaponModal'));

export default function Weapons() {
	const { showModal } = useModal();

	const [type, setType] = useParamState<WeaponType>('type', null);
	const [rarity, setRarity] = useParamState('rarity', 0);

	const [search, setSearch] = useState('');

	const weapons = useWeapons({ type, rarity: +rarity, search });

	return (
		<Container>
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
				<Grid container spacing={1}>
					<Grid size={12}>
						<TextField
							placeholder='Search'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Grid>
					{weapons.map((weapon) => (
						<Grid key={weapon.id}>
							<WeaponCharacterImage
								weapon={weapon}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => showModal(EditWeaponModal, { props: { weapon } })}>
								{weapon?.lock && (
									<LockIcon
										sx={{
											position: 'absolute',
											bottom: 0,
											right: 0,
											bgcolor: 'white',
											borderRadius: 1,
											opacity: 0.75,
										}}
									/>
								)}
							</WeaponCharacterImage>
						</Grid>
					))}
				</Grid>
			</PageSection>
		</Container>
	);
}
