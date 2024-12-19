import { weaponsInfo } from '@/api/weapons';
import makeArray from '@/src/helpers/makeArray';
import type { Build } from '@/src/types/data';
import { AvatarGroup, Stack } from '@mui/material';
import WeaponImage from '../../weapons/weaponImage';

export default function CharacterWeaponTier({ build }: { build: Build }) {
	return (
		<Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
			{build.weapon.map((weaponTier, index) => (
				<AvatarGroup key={index} sx={{ flexDirection: 'row-reverse' }} variant='rounded'>
					{makeArray(weaponTier)
						.toReversed()
						.map((weapon) => (
							<WeaponImage key={weapon} weapon={weaponsInfo[weapon]} size={50} />
						))}
				</AvatarGroup>
			))}
		</Stack>
	);
}
