'use client';
import ArtifactImage from '@/components/images/artifact';
import CharacterImage from '@/components/images/character';
import Page from '@/components/page';
import data from '@/public/data.json';
import { useAppSelector } from '@/src/store/hooks';
import { Box, Grid } from '@mui/material';
import { filter, orderBy } from 'lodash';
import { useState } from 'react';
import { tier } from '../tier';
import ArtifactCard from './artifactCard';
import ArtifactFilter from './artifactFilter';

/*
click artifact to show who best can equip it ranked by character I guess? and compares with current equip
*/
export default function Artifacts() {
	const good = useAppSelector(({ good }) => good);

	const [artifactSet, setArtifactSet] = useState('');

	const content = artifactSet
		? filter(tier, (character) => character.artifact.indexOf(artifactSet as any) === 0).map(
				(character) => (
					<CharacterImage
						key={character.key}
						character={data.characters[character.key]}
						sx={{ mr: 1 }}
					/>
				),
		  )
		: orderBy(data.artifacts, 'order').map((artifact) => (
				<Box key={artifact.key}>
					<ArtifactImage artifact={artifact} type='flower' />
					{filter(tier, (character) => character.artifact.indexOf(artifact.key) === 0).map(
						(character) => (
							<CharacterImage
								key={character.key}
								character={data.characters[character.key]}
								sx={{ ml: 1 }}
							/>
						),
					)}
				</Box>
		  ));

	return (
		<Page noSsr title='Artifacts'>
			<ArtifactFilter artifactSet={artifactSet} setArtifactSet={setArtifactSet} />
			{content}
			{artifactSet && (
				<Grid container spacing={1}>
					{good.artifacts
						.filter((artifact) => artifact.setKey === artifactSet)
						.map((artifact, index) => (
							<Grid key={index} item>
								<ArtifactCard artifact={artifact} />
							</Grid>
						))}
				</Grid>
			)}
		</Page>
	);
}
