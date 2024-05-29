'use client';
import { useWeapons, WeaponType } from '@/api/weapons';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { Grid, Input } from '@mui/joy';
import { useState } from 'react';
import AddWeaponModal from './modal/addWeaponModal';
import OptimalWeaponModal from './modal/optimalWeaponModal';
import WeaponModal from './modal/weaponModal';
import WeaponCharacterImage from './weaponCharacterImage';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const { showModal } = useModal();

	const [type, setType] = useParamState<WeaponType>('type', null);

	const [search, setSearch] = useState('');

	const weapons = useWeapons({ type, search });

	return (
		<PageContainer noSsr>
			<PageTitle>Weapons</PageTitle>
			<WeaponTypeFilter weaponType={type} setWeaponType={setType} />
			<PageSection
				title={type || 'All'}
				actions={[
					{ name: 'Add', onClick: () => showModal(AddWeaponModal) },
					{ name: 'Optimize', onClick: () => showModal(OptimalWeaponModal) },
				]}>
				<Grid container spacing={1}>
					<Grid xs={12}>
						<Input
							placeholder='Search'
							value={search}
							onChange={({ target }) => setSearch(target.value)}
						/>
					</Grid>
					{weapons.map((weapon) => (
						<Grid key={weapon.key}>
							<WeaponCharacterImage
								weapon={weapon}
								sx={{ ':hover': { cursor: 'pointer' } }}
								onClick={() => showModal(WeaponModal, { props: { weapon } })}
							/>
						</Grid>
					))}
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
