'use client';
import { artifactSetsInfo } from '@/api/artifacts';
import pget from '@/src/helpers/pget';
import type { DArtifact } from '@/src/types/data';
import { Button, ButtonGroup, Grid } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { groupBy, pipe, reverse, sortBy } from 'remeda';
import ArtifactSetImage from './artifactSetImage';

export default function ArtifactSetFilter() {
	const searchParams = useSearchParams();

	const query = useMemo(() => Object.fromEntries(searchParams), [searchParams]);

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
		<Grid container columnSpacing={1}>
			<Grid>
				<ButtonGroup>
					<Button sx={{ height: 50 }} component={Link} href='/artifacts'>
						All
					</Button>
					<Button
						sx={{ height: 50 }}
						component={Link}
						href={{ pathname: '/artifacts/all', query } as any}>
						Unused
					</Button>
				</ButtonGroup>
			</Grid>
			{artifactGroups.map((artifactGroup, index) => (
				<Grid key={index}>
					<ButtonGroup>
						{sortBy(artifactGroup, pget('order')).map((artifactSet) => (
							<Button
								key={artifactSet.key}
								sx={{ p: 0, overflow: 'hidden' }}
								component={Link}
								href={{ pathname: `/artifacts/${artifactSet.key}`, query } as any}>
								<ArtifactSetImage artifactSet={artifactSet} size={50} variant='square' />
							</Button>
						))}
					</ButtonGroup>
				</Grid>
			))}
		</Grid>
	);
}
