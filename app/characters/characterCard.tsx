import CharacterImage from '@/components/images/character';
import { PageLinkComponent } from '@/components/page/link';
import type { DCharacter } from '@/src/data';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo } from 'react';
import CharactersArtifact from './charactersArtifact';
import CharactersWeapon from './charactersWeapon';

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
		<Paper
			sx={{ display: 'flex', alignItems: 'center', p: 1, textDecoration: 'none' }}
			component={PageLinkComponent}
			href={`/characters/${character.key}`}>
			<Stack spacing={0.5}>
				<CharactersWeapon weapon={weapon} tier={characterTier} />
				<CharactersArtifact type='flower' artifact={flower} tier={characterTier} />
				<CharactersArtifact type='plume' artifact={plume} tier={characterTier} />
			</Stack>
			<Stack alignItems='center' textAlign='center' mx={1}>
				<CharacterImage character={character} size={80} />
				<Typography width={80}>{character.name}</Typography>
			</Stack>
			<Stack spacing={0.5}>
				<CharactersArtifact type='sands' artifact={sands} tier={characterTier} />
				<CharactersArtifact type='goblet' artifact={goblet} tier={characterTier} />
				<CharactersArtifact type='circlet' artifact={circlet} tier={characterTier} />
			</Stack>
		</Paper>
	);
}
