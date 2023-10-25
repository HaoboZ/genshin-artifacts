import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import type { IWeapon } from '@/src/types/good';
import type { BoxProps } from '@mui/joy';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { weaponsInfo } from './weaponData';
import WeaponImage from './weaponImage';

export default function WeaponCharacterImage({
	weapon,
	size = 100,
	children,
	...props
}: { weapon: IWeapon; size?: number } & BoxProps) {
	const character = charactersInfo[weapon.location];
	const characterTier = charactersTier[weapon.location];

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
						position='absolute'
						bottom={0}
						right={0}
						border={1}
					/>
				)}
			</WeaponImage>
			{character && <PercentBar p={percent} />}
		</Box>
	);
}
