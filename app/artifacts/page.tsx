'use client';
import ArtifactImage from '@/components/images/artifact';
import CharacterImage from '@/components/images/character';
import Page from '@/components/page';
import data from '@/public/data.json';
import { useAppSelector } from '@/src/store/hooks';
import { Grid, ToggleButton, toggleButtonClasses, ToggleButtonGroup } from '@mui/material';
import { Box } from '@mui/system';
import { groupBy, map, sortBy } from 'lodash';
import { useState } from 'react';
import { tier } from '../tier';
import ArtifactCard from './artifactCard';

/*
click artifact to show who best can equip it ranked by character I guess? and compares with current equip
*/
export default function Artifacts() {
	const good = useAppSelector(({ good }) => good);

	const [artifactSet, setArtifactSet] = useState('');

	return (
		<Page title='Artifacts'>
			<Grid
				container
				columnSpacing={1}
				sx={{ [`.${toggleButtonClasses.root}`]: { height: 50 } }}>
				<Grid item>
					<ToggleButton
						value=''
						selected={artifactSet === ''}
						onChange={() => setArtifactSet('')}>
						None
					</ToggleButton>
				</Grid>
				{map(groupBy(data.artifacts, 'group'), (artifactGroup, index) => (
					<Grid key={index} item>
						<ToggleButtonGroup
							exclusive
							value={artifactSet}
							onChange={(e, newElement) => newElement && setArtifactSet(newElement)}>
							{sortBy(artifactGroup, 'order').map((artifact) => (
								<ToggleButton key={artifact.key} value={artifact.key} sx={{ p: 0 }}>
									<ArtifactImage artifact={artifact} type='flower' />
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Grid>
				))}
			</Grid>
			{map(
				groupBy(tier, (character) => character.artifact.indexOf(artifactSet)),
				(tier, key) => {
					if (key === '-1') return null;
					return (
						<Box key={key}>
							{key}
							{tier.map((character) => (
								<CharacterImage
									key={character.key}
									character={data.characters[character.key]}
								/>
							))}{' '}
						</Box>
					);
				},
			)}
			<Grid container spacing={1}>
				{good.artifacts
					.filter((artifact) => artifact.setKey === artifactSet)
					.map((artifact, index) => (
						<Grid key={index} item>
							<ArtifactCard artifact={artifact} />
						</Grid>
					))}
			</Grid>
		</Page>
	);
}
