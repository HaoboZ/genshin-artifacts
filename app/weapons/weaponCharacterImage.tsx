import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weaponsInfo } from '@/api/weapons';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import type { IWeapon } from '@/src/types/good';
import type { AvatarProps } from '@mui/material';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import CharacterImage from '../characters/characterImage';
import WeaponImage from './weaponImage';

export default function WeaponCharacterImage({
	weapon,
	size = 100,
	children,
	...props
}: { weapon: IWeapon; size?: number } & AvatarProps) {
	const character = charactersInfo[weapon.location];
	const characterTier = builds[weapon.location];

	const percent = useMemo(() => {
		if (!characterTier) return 0;
		const index = arrDeepIndex(characterTier.weapon, weapon.key);
		return index === -1
			? 0
			: 1 - arrDeepIndex(characterTier.weapon, weapon.key) / characterTier.weapon.length;
	}, []);

	return (
		<Box width={size}>
			<WeaponImage weapon={weaponsInfo[weapon.key]} {...props}>
				{character && (
					<CharacterImage
						character={character}
						size={size / 2}
						sx={{ position: 'absolute', bottom: 0, right: 0, border: 1 }}
					/>
				)}
			</WeaponImage>
			{character && <PercentBar p={percent} />}
		</Box>
	);
}
