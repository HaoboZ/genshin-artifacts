import OverflowTypography from '@/components/overflowTypography';
import PercentBar from '@/components/percentBar';
import SubStatBar from '@/components/subStatBar';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import type { IArtifact } from '@/src/types/good';
import type { CardProps } from '@mui/joy';
import { Box, Card, Grid } from '@mui/joy';
import { charactersInfo } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { statName } from './artifactData';
import ArtifactImage from './artifactImage';
import getArtifactTier from './getArtifactTier';

export default function ArtifactCharacterCard({
	artifact,
	tier,
	rating,
	subStat,
	...props
}: { artifact: IArtifact; tier: Tier; rating: number; subStat: number } & CardProps) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);

	const currentArtifact = artifacts.find(
		({ location, slotKey }) => location === tier.key && slotKey === artifact.slotKey,
	);
	const currentArtifactTier = getArtifactTier(tier, currentArtifact);

	return (
		<Card {...props}>
			<Grid container columnSpacing={1}>
				<Grid xs='auto'>
					<CharacterImage character={charactersInfo[tier.key]} position='relative'>
						{currentArtifact && (
							<ArtifactImage
								artifact={currentArtifact}
								size={50}
								position='absolute'
								bottom={0}
								right={0}
								border={1}
							/>
						)}
					</CharacterImage>
				</Grid>
				<Grid xs>
					{currentArtifact && (
						<Box>
							<OverflowTypography>
								{statName[currentArtifact.mainStatKey]}
							</OverflowTypography>
							{currentArtifact.substats.map((substat) => (
								<SubStatBar
									key={substat.key}
									substat={substat}
									rarity={currentArtifact.rarity}
								/>
							))}
						</Box>
					)}
				</Grid>
				<Grid container xs={12}>
					<Grid xs={6}>
						New
						<PercentBar p={rating} />
						<PercentBar p={subStat} />
					</Grid>
					{currentArtifact && (
						<Grid xs={6}>
							Old
							<PercentBar
								p={currentArtifactTier.rating / (currentArtifactTier.rarity ? 1 : 2)}
							/>
							<PercentBar
								p={currentArtifactTier.subStat / (currentArtifactTier.mainStat ? 1 : 2)}
							/>
						</Grid>
					)}
				</Grid>
			</Grid>
		</Card>
	);
}
