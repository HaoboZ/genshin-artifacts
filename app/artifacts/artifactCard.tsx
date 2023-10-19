import ArtifactImage from '@/components/images/artifact';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact } from '@/src/good';
import { statName } from '@/src/resources/stats';
import type { PaperProps } from '@mui/material';
import { Box, Paper, Typography } from '@mui/material';

export default function ArtifactCard({
	artifact,
	hideCharacter,
	sx,
	...props
}: {
	artifact: IArtifact;
	hideCharacter?: boolean;
} & PaperProps) {
	return (
		<Paper sx={{ display: 'flex', width: 220, p: 1, ...sx }} {...props}>
			<ArtifactImage hideCharacter={hideCharacter} artifact={artifact} size={100} />
			<Box width='100%' ml={1}>
				<Typography variant='body2'>{statName[artifact.mainStatKey]}</Typography>
				{artifact.substats.map((substat) => (
					<SubStatBar key={substat.key} showValue substat={substat} rarity={artifact.rarity} />
				))}
			</Box>
		</Paper>
	);
}
