'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useParamState from '@/src/hooks/useParamState';
import { Grid } from '@mui/joy';
import type { WeaponType } from './weaponData';
import { weaponsInfo } from './weaponData';
import WeaponImage from './weaponImage';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const [weaponType, setWeaponType] = useParamState<WeaponType>('type', null);

	return (
		<PageContainer>
			<PageTitle>Weapons</PageTitle>
			<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
			<PageSection title={weaponType || 'All'}>
				<Grid container spacing={1}>
					{Object.values(weaponsInfo)
						.filter((weapon) => !weaponType || weapon.weaponType === weaponType)
						.map((weapon) => (
							<Grid key={weapon.key}>
								<WeaponImage weapon={weapon} />
							</Grid>
						))}
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
