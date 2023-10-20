import ArtifactImage from '@/components/images/artifact';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact, SlotKey } from '@/src/good';
import { statName } from '@/src/resources/stats';
import type { PaperProps } from '@mui/material';
import { Box, Paper, Typography } from '@mui/material';

export default function ArtifactCard({
	artifact,
	type,
	hideCharacter,
	sx,
	children,
	...props
}: {
	artifact: IArtifact;
	type?: SlotKey;
	hideCharacter?: boolean;
} & PaperProps) {
	return (
		<Paper sx={{ p: 1, ...sx }} {...props}>
			<Box display='flex'>
				<ArtifactImage
					hideCharacter={hideCharacter}
					artifact={artifact}
					type={type}
					size={100}
				/>
				{artifact && (
					<Box width='100%' ml={1}>
						<Typography>{statName[artifact.mainStatKey]}</Typography>
						{artifact.substats.map((substat) => (
							<SubStatBar key={substat.key} substat={substat} rarity={artifact.rarity} />
						))}
					</Box>
				)}
			</Box>
			{children}
		</Paper>
	);
}
