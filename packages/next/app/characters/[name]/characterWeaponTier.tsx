import makeArray from '@/src/helpers/makeArray';
import { type Build } from '@/src/types/data';
import { AvatarGroup, Box, Stack } from '@mui/material';
import WeaponImage from '../../weapons/weaponImage';

export default function CharacterWeaponTier({ build }: { build: Build }) {
	return (
		<Box>
			<Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
				{build.weapon.map((weaponTier, index) => (
					<AvatarGroup
						key={index}
						sx={{ flexDirection: 'row-reverse' }}
						variant='rounded'
						max={99}>
						{makeArray(weaponTier).map((weapon) => (
							<WeaponImage key={weapon} weapon={weapon} size={50} />
						))}
					</AvatarGroup>
				))}
			</Stack>
		</Box>
	);
}
