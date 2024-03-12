'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import { Grid, Input } from '@mui/joy';
import { useMemo, useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import AddWeaponModal from './addWeaponModal';
import OptimalWeaponModal from './optimalWeaponModal';
import WeaponCharacterImage from './weaponCharacterImage';
import type { WeaponType } from './weaponData';
import { weaponsInfo } from './weaponData';
import WeaponModal from './weaponModal';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const weapons = useAppSelector(({ good }) => good.weapons);
	const { showModal } = useModal();

	const [type, setType] = useParamState<WeaponType>('type', null);

	const [search, setSearch] = useState('');
	const searchVal = search.toLowerCase();

	const weaponsSorted = useMemo(
		() =>
			pipe(
				weapons,
				map((weapon) => ({ ...weapon, ...weaponsInfo[weapon.key] })),
				filter(
					({ weaponType, name }) =>
						(!type || weaponType === type) &&
						(search ? name.toLowerCase().includes(searchVal) : true),
				),
				sortBy(({ rarity }) => -rarity, pget('key')),
			),
		[weapons, type, search],
	);

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
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Grid>
					{weaponsSorted.map((weapon) => (
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
