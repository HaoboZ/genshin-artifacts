'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import type { DWeapon } from '@/src/types/data';
import type { IWeapon } from '@/src/types/good';
import { Grid } from '@mui/joy';
import { compose, sortBy, sortByPath } from 'rambdax';
import { useMemo } from 'react';
import AddWeaponModal from './addWeaponModal';
import WeaponCharacterImage from './weaponCharacterImage';
import type { WeaponType } from './weaponData';
import { weaponsInfo } from './weaponData';
import WeaponModal from './weaponModal';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const weapons = useAppSelector(({ good }) => good.weapons);
	const { showModal } = useModal();

	const [type, setType] = useParamState<WeaponType>('type', null);

	const weaponsSorted = useMemo(
		() =>
			compose(
				sortBy<IWeapon & DWeapon>(({ rarity }) => -rarity),
				sortByPath('key'),
			)(
				weapons
					.map((weapon) => ({ ...weapon, ...weaponsInfo[weapon.key] }))
					.filter(({ weaponType }) => !type || weaponType === type),
			),
		[weapons, type],
	);

	return (
		<PageContainer noSsr>
			<PageTitle>Weapons</PageTitle>
			<WeaponTypeFilter weaponType={type} setWeaponType={setType} />
			<PageSection
				title={type || 'All'}
				actions={[{ name: 'Add', onClick: () => showModal(AddWeaponModal) }]}>
				<Grid container spacing={1}>
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
