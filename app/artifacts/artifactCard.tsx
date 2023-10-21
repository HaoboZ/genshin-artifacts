import OverflowTypography from '@/components/overflowTypography';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact, SlotKey } from '@/src/types/good';
import type { CardProps } from '@mui/joy';
import { Box, Card, Grid } from '@mui/joy';
import { charactersInfo } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { statName } from './artifactData';
import ArtifactImage from './artifactImage';

export default function ArtifactCard({
	artifact,
	slot,
	hideCharacter,
	children,
	...props
}: { artifact: IArtifact; slot?: SlotKey; hideCharacter?: boolean } & CardProps) {
	return (
		<Card {...props}>
			<Grid container spacing={1}>
				<Grid xs='auto'>
					<ArtifactImage artifact={artifact} slot={slot}>
						{!hideCharacter && artifact.location && (
							<CharacterImage
								character={charactersInfo[artifact.location]}
								size={50}
								position='absolute'
								bottom={0}
								right={0}
								border={1}
							/>
						)}
					</ArtifactImage>
				</Grid>
				<Grid xs>
					{artifact && (
						<Box>
							<OverflowTypography>{statName[artifact.mainStatKey]}</OverflowTypography>
							{artifact.substats.map((substat) => (
								<SubStatBar key={substat.key} substat={substat} rarity={artifact.rarity} />
							))}
						</Box>
					)}
				</Grid>
				{children && <Grid xs={12}>{children}</Grid>}
			</Grid>
		</Card>
	);
}
