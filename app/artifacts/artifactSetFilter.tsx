import type { DArtifact } from '@/src/types/data';
import type { ArtifactSetKey } from '@/src/types/good';
import { Button, Grid, IconButton, ToggleButtonGroup } from '@mui/joy';
import { groupBy, path, sortByPath } from 'rambdax';
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
			{Object.values(groupBy<DArtifact>(path('group'), Object.values(artifactSetsInfo))).map(
				(artifactGroup, index) => (
					<Grid key={index}>
						<ToggleButtonGroup
							value={artifactSet}
							sx={{ overflow: 'hidden' }}
							onChange={(e, newElement) => newElement && setArtifactSet(newElement)}>
							{sortByPath('order', artifactGroup).map((artifactSet) => (
								<IconButton key={artifactSet.key} value={artifactSet.key} sx={{ px: 0 }}>
									<ArtifactSetImage artifactSet={artifactSet} size={50} borderRadius={0} />
								</IconButton>
							))}
						</ToggleButtonGroup>
					</Grid>
				),
			)}
		</Grid>
	);
}
