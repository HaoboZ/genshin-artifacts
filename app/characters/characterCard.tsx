import CharacterImage from '@/components/images/character';
import type { DCharacter } from '@/src/data';
import { useAppSelector } from '@/src/store/hooks';
import { Box, Paper } from '@mui/material';
import { useMemo } from 'react';
import { tier } from '../tier';
import ArtifactCard from './artifactCard';
import WeaponCard from './weaponCard';

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
		<Paper sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
			<Box display='flex' flexDirection='column'>
				<WeaponCard weapon={weapon} tier={characterTier} />
				<ArtifactCard type='flower' artifact={flower} tier={characterTier} />
				<ArtifactCard type='plume' artifact={plume} tier={characterTier} />
			</Box>
			<CharacterImage character={character} size={80} sx={{ m: 1 }} />
			<Box display='flex' flexDirection='column'>
				<ArtifactCard type='sands' artifact={sands} tier={characterTier} />
				<ArtifactCard type='goblet' artifact={goblet} tier={characterTier} />
				<ArtifactCard type='circlet' artifact={circlet} tier={characterTier} />
			</Box>
		</Paper>
	);
}
