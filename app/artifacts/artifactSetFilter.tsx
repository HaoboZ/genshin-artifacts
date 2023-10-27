import pget from '@/src/helpers/pget';
import { DArtifact } from '@/src/types/data';
import type { ArtifactSetKey } from '@/src/types/good';
import { Button, Grid, IconButton, ToggleButtonGroup } from '@mui/joy';
import { groupBy, pipe, reverse, sortBy } from 'remeda';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetImage from './artifactSetImage';

export default function ArtifactSetFilter({
	artifactSet,
	setArtifactSet,
}: {
	artifactSet: ArtifactSetKey;
	setArtifactSet: (artifactSet: ArtifactSetKey) => void;
}) {
	return (
		<Grid container columnSpacing={1}>
			<Grid>
				<Button
					variant={artifactSet ? 'outlined' : 'solid'}
					sx={{ height: 50 }}
					onClick={() => setArtifactSet(null)}>
					All
				</Button>
			</Grid>
			{pipe(
				artifactSetsInfo,
				Object.values<DArtifact>,
				groupBy(pget('group')),
				Object.values<DArtifact[]>,
				reverse(),
			).map((artifactGroup, index) => (
				<Grid key={index}>
					<ToggleButtonGroup
						value={artifactSet}
						sx={{ overflow: 'hidden' }}
						onChange={(e, newElement) => newElement && setArtifactSet(newElement)}>
						{sortBy(artifactGroup, ({ order }) => order).map((artifactSet) => (
							<IconButton key={artifactSet.key} value={artifactSet.key} sx={{ px: 0 }}>
								<ArtifactSetImage artifactSet={artifactSet} size={50} borderRadius={0} />
							</IconButton>
						))}
					</ToggleButtonGroup>
				</Grid>
			))}
		</Grid>
	);
}
