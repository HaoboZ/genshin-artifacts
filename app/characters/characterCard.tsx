import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import type { DCharacter } from '@/src/types/data';
import { Card, Grid } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import CharacterImage from './characterImage';

export default function CharacterCard({ character }: { character: DCharacter }) {
	const good = useAppSelector(({ good }) => good);

	const [characterTier, weapon, flower, plume, sands, goblet, circlet] = useMemo(() => {
		const characterTier = tier[character.key];
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
		<Card component={Link} href={`/characters/${character.key}`}>
			<Grid container>
				<Grid xs={12} display='flex' justifyContent='center'>
					<CharacterImage character={character} size={80} />
				</Grid>
			</Grid>
			{/*	<CharactersWeapon weapon={weapon} tier={characterTier} />*/}
			{/*	<CharactersArtifact type='flower' artifact={flower} tier={characterTier} />*/}
			{/*	<CharactersArtifact type='plume' artifact={plume} tier={characterTier} />*/}
			{/*	<CharactersArtifact type='sands' artifact={sands} tier={characterTier} />*/}
			{/*	<CharactersArtifact type='goblet' artifact={goblet} tier={characterTier} />*/}
			{/*	<CharactersArtifact type='circlet' artifact={circlet} tier={characterTier} />*/}
		</Card>
	);
}
