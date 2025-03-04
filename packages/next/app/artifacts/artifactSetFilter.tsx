import { artifactSetsInfo } from '@/api/artifacts';
import pget from '@/src/helpers/pget';
import type { DArtifact } from '@/src/types/data';
import { Button, ButtonGroup, Grid2 } from '@mui/material';
import Link from 'next/link';
import { useMemo } from 'react';
import { groupBy, pipe, reverse, sortBy } from 'remeda';
import ArtifactSetImage from './artifactSetImage';

export default function ArtifactSetFilter() {
	const artifactGroups = useMemo(
		() =>
			pipe(
				artifactSetsInfo,
				Object.values<DArtifact>,
				groupBy(pget('group')),
				Object.values<DArtifact[]>,
				reverse(),
			),
		[],
	);

	return (
		<Grid2 container columnSpacing={1}>
			<Grid2>
				<ButtonGroup>
					<Button sx={{ height: 50 }} component={Link} href='/artifacts'>
						All
					</Button>
					<Button sx={{ height: 50 }} component={Link} href='/artifacts/all?rarity=5'>
						Unused
					</Button>
				</ButtonGroup>
			</Grid2>
			{artifactGroups.map((artifactGroup, index) => (
				<Grid2 key={index}>
					<ButtonGroup>
						{sortBy(artifactGroup, pget('order')).map((artifactSet) => (
							<Button
								key={artifactSet.key}
								sx={{ p: 0, overflow: 'hidden' }}
								component={Link}
								href={`/artifacts/${artifactSet.key}`}>
								<ArtifactSetImage artifactSet={artifactSet} size={50} variant='square' />
							</Button>
						))}
					</ButtonGroup>
				</Grid2>
			))}
		</Grid2>
	);
}
