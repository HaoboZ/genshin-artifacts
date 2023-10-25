import type { IWeapon } from '@/src/types/good';
import type { BoxProps } from '@mui/joy';
import { charactersInfo } from '../characters/characterData';
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
	return (
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
			{children}
		</WeaponImage>
	);
}
