import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { DCharacter } from '@/src/types/data';
import { Card, Grid } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import { weaponsInfo } from '../weapons/weaponData';
import { charactersTier } from './characterData';
import CharacterImage from './characterImage';
import CharactersArtifact from './charactersArtifact';
import CharactersWeapon from './charactersWeapon';

export default function CharacterCard({ character }: { character: DCharacter }) {
	const good = useAppSelector(pget('good'));

	const [characterTier, weapon, flower, plume, sands, goblet, circlet] = useMemo(() => {
		const characterTier = charactersTier[character.key];
		const weapon = good.weapons.find(({ location }) => location === character.key);
		const artifacts = good.artifacts.filter(({ location }) => location === character.key);
		const flower = artifacts.find(({ slotKey }) => slotKey === 'flower');
		const plume = artifacts.find(({ slotKey }) => slotKey === 'plume');
		const sands = artifacts.find(({ slotKey }) => slotKey === 'sands');
		const goblet = artifacts.find(({ slotKey }) => slotKey === 'goblet');
		const circlet = artifacts.find(({ slotKey }) => slotKey === 'circlet');
		return [characterTier, weapon, flower, plume, sands, goblet, circlet];
	}, [good, character]);

	return (
		<Card
			component={Link}
			href={`/characters/${character.key}`}
			sx={{ width: 188, textDecoration: 'none' }}>
			<Grid container spacing={0.5}>
				<Grid xs={12} display='flex' justifyContent='center'>
					<CharacterImage character={character} />
				</Grid>
				<Grid xs={4}>
					<CharactersWeapon weapon={weaponsInfo[weapon?.key]} tier={characterTier} />
				</Grid>
				<Grid xs={4}>
					<CharactersArtifact artifact={flower} slot='flower' tier={characterTier} />
				</Grid>
				<Grid xs={4}>
					<CharactersArtifact artifact={plume} slot='plume' tier={characterTier} />
				</Grid>
				<Grid xs={4}>
					<CharactersArtifact artifact={sands} slot='sands' tier={characterTier} />
				</Grid>
				<Grid xs={4}>
					<CharactersArtifact artifact={goblet} slot='goblet' tier={characterTier} />
				</Grid>
				<Grid xs={4}>
					<CharactersArtifact artifact={circlet} slot='circlet' tier={characterTier} />
				</Grid>
			</Grid>
		</Card>
	);
}
