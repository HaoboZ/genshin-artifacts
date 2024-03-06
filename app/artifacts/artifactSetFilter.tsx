import pget from '@/src/helpers/pget';
import type { DArtifact } from '@/src/types/data';
import type { ArtifactSetKey } from '@/src/types/good';
import { Button, ButtonGroup, Grid, IconButton } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import { groupBy, pipe, reverse, sortBy } from 'remeda';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetImage from './artifactSetImage';

export default function ArtifactSetFilter({ artifactSet }: { artifactSet?: ArtifactSetKey }) {
	const artifactGroups = useMemo(
		() =>
			pipe(
				artifactSetsInfo,
				Object.values<DArtifact>,
				groupBy(pget('group')),
				Object.values<DArtifact[]>,
				reverse(),
			),
		[artifactSet],
	);

	return (
		<Grid container columnSpacing={1}>
			<Grid>
				<Button
					variant={artifactSet ? 'outlined' : 'solid'}
					sx={{ height: 50 }}
					component={Link}
					href='/artifacts'>
					All
				</Button>
			</Grid>
			{artifactGroups.map((artifactGroup, index) => (
				<Grid key={index}>
					<ButtonGroup sx={{ overflow: 'hidden' }}>
						{sortBy(artifactGroup, pget('order')).map((artifactSet) => (
							<IconButton
								key={artifactSet.key}
								sx={{ px: 0 }}
								component={Link}
								href={`/artifacts/${artifactSet.key}`}>
								<ArtifactSetImage artifactSet={artifactSet} size={50} borderRadius={0} />
							</IconButton>
						))}
					</ButtonGroup>
				</Grid>
			))}
		</Grid>
	);
}
