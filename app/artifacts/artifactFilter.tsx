import ArtifactImage from '@/components/images/artifact';
import { data } from '@/src/resources/data';
import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { groupBy, map, sortBy } from 'lodash';

export default function ArtifactFilter({
	artifactSet,
	setArtifactSet,
}: {
	artifactSet: string;
	setArtifactSet: (artifactSet: string) => void;
}) {
	return (
		<Grid container columnSpacing={1}>
			<Grid item>
				<ToggleButton
					value=''
					sx={{ height: 50 }}
					selected={artifactSet === ''}
					onChange={() => setArtifactSet('')}>
					All
				</ToggleButton>
			</Grid>
			{map(groupBy(data.artifacts, 'group'), (artifactGroup, index) => (
				<Grid key={index} item>
					<ToggleButtonGroup
						exclusive
						value={artifactSet}
						onChange={(e, newElement) => newElement && setArtifactSet(newElement)}>
						{sortBy(artifactGroup, 'order').map((artifact) => (
							<ToggleButton
								key={artifact.key}
								value={artifact.key}
								sx={{ p: 0, height: 50 }}>
								<ArtifactImage artifactSet={artifact} type='flower' />
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Grid>
			))}
		</Grid>
	);
}
