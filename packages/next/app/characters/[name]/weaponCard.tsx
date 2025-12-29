import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/stats/percentBar';
import arrDeepIndex from '@/helpers/arrDeepIndex';
import { type Build } from '@/types/data';
import { type IWeapon } from '@/types/good';
import { Card, CardContent, type CardProps, Grid, Typography } from '@mui/material';
import { Fragment, useMemo } from 'react';
import WeaponImage from '../../weapons/weaponImage';

export default function WeaponCard({
	build,
	weapon,
	...props
}: { build: Build; weapon: IWeapon } & CardProps) {
	const weaponTier = useMemo(() => {
		if (!weapon) return 0;
		const index = arrDeepIndex(build.weapon, weapon.key);
		return index !== -1 ? 1 - index / build.weapon.length : 0;
	}, [build, weapon]);

	return (
		<Card {...props}>
			<CardContent>
				<Grid container spacing={1}>
					<Grid size='auto'>
						<WeaponImage weapon={weapon} type={charactersInfo[build.key].weaponType} />
					</Grid>
					{weapon && (
						<Fragment>
							<Grid size='grow'>
								<Typography>{weaponsInfo[weapon?.key]?.name}</Typography>
							</Grid>
							<Grid size={12}>
								<PercentBar p={weaponTier} />
							</Grid>
						</Fragment>
					)}
				</Grid>
			</CardContent>
		</Card>
	);
}
