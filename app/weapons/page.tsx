'use client';
import WeaponImage from '@/components/images/weapon';
import Page from '@/components/page';
import PageSection from '@/components/page/section';
import useParamState from '@/src/hooks/useParamState';
import { data } from '@/src/resources/data';
import { Grid } from '@mui/material';
import WeaponTypeFilter from './weaponTypeFilter';

export default function Weapons() {
	const [weaponType, setWeaponType] = useParamState('type', '');

	return (
		<Page title='Weapons'>
			<WeaponTypeFilter weaponType={weaponType} setWeaponType={setWeaponType} />
			<PageSection title={weaponType || 'All'}>
				<Grid container spacing={0.5} py={1}>
					{Object.values(data.weapons)
						.filter((weapon) => !weaponType || weapon.weaponType === weaponType)
						.map((weapon) => (
							<Grid key={weapon.key} item>
								<WeaponImage weapon={weapon} size={80} />
							</Grid>
						))}
				</Grid>
			</PageSection>
		</Page>
	);
}
