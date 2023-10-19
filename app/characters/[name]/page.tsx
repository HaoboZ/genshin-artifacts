'use client';
import Image from '@/components/image';
import CharacterImage from '@/components/images/character';
import WeaponImage from '@/components/images/weapon';
import Page from '@/components/page';
import PageSection from '@/components/page/section';
import { data } from '@/src/resources/data';
import { artifactOrder } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { sortBy } from 'lodash';
import { notFound } from 'next/navigation';
import { createSelector } from 'reselect';
import ArtifactCard from '../../artifacts/artifactCard';

const selectArtifacts = createSelector(
	[({ good }) => good.artifacts, (state, character) => character],
	(artifacts, character) => artifacts.filter(({ location }) => location === character),
);

export default function Character({ params }: { params: { name: string } }) {
	const character = data.characters[params.name];
	if (!character) notFound();

	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === character.key),
	);
	const artifacts = useAppSelector((state) => selectArtifacts(state, character.key));
	const artifactsOrdered = sortBy(artifacts, ({ slotKey }) => artifactOrder.indexOf(slotKey));
	const characterTier = tier[character.key];

	return (
		<Page
			noSsr
			title={
				<Stack direction='row' spacing={1}>
					{character.name}
					<Image
						alt={character.element}
						src={data.elements[character.element]?.image}
						width={30}
						height={30}
					/>
				</Stack>
			}>
			<CharacterImage character={character} size={100} />
			<Typography>TODO: tier of best weapons, artifacts, and stats</Typography>
			<PageSection title='Equipped'>
				<Grid container>
					<Grid item xs={6} sm={4} md={3} lg={2}>
						<Paper sx={{ display: 'flex', width: 180, p: 1 }}>
							<WeaponImage weapon={data.weapons[weapon?.key]} size={100} />
						</Paper>
					</Grid>
					{artifactsOrdered.map((artifact) => (
						<Grid key={artifact.slotKey} item xs={6} sm={4} md={3} lg={2}>
							<ArtifactCard hideCharacter artifact={artifact} />
						</Grid>
					))}
				</Grid>
			</PageSection>
		</Page>
	);
}
