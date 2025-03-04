import { charactersInfo } from '@/api/characters';
import { statName } from '@/api/stats';
import OverflowTypography from '@/components/overflowTypography';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { Lock as LockIcon } from '@mui/icons-material';
import type { CardProps } from '@mui/material';
import { Box, Card, CardContent, Grid2 } from '@mui/material';
import CharacterImage from '../characters/characterImage';
import ArtifactImage from './artifactImage';

export default function ArtifactStatImage({
	artifact,
	slot,
	hideCharacter,
	children,
	...props
}: { artifact: IArtifact; slot?: SlotKey; hideCharacter?: boolean } & CardProps) {
	return (
		<Card {...props}>
			<CardContent>
				<Grid2 container spacing={1}>
					<Grid2 size='auto'>
						<ArtifactImage artifact={artifact} slot={slot}>
							{!hideCharacter && artifact.location && (
								<CharacterImage
									character={charactersInfo[artifact.location]}
									size={50}
									sx={{ position: 'absolute', bottom: 0, right: 0, border: 1 }}
								/>
							)}
							{artifact?.lock && (
								<LockIcon
									sx={{
										position: 'absolute',
										top: 0,
										right: 0,
										bgcolor: 'white',
										borderRadius: 1,
										opacity: 0.75,
									}}
								/>
							)}
						</ArtifactImage>
					</Grid2>
					<Grid2 size='grow'>
						{artifact && (
							<Box>
								<OverflowTypography>{statName[artifact.mainStatKey]}</OverflowTypography>
								{artifact.substats.map((substat) => (
									<SubStatBar key={substat.key} substat={substat} />
								))}
							</Box>
						)}
					</Grid2>
					{children}
				</Grid2>
			</CardContent>
		</Card>
	);
}
