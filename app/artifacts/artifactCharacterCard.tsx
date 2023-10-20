import ArtifactImage from '@/components/images/artifact';
import CharacterImage from '@/components/images/character';
import PercentBar from '@/components/percentBar';
import SubStatBar from '@/components/subStatBar';
import type { Tier } from '@/src/data';
import type { IArtifact } from '@/src/good';
import getArtifactTier from '@/src/helpers/getArtifactTier';
import { data } from '@/src/resources/data';
import { statName } from '@/src/resources/stats';
import { useAppSelector } from '@/src/store/hooks';
import type { PaperProps } from '@mui/material';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';

export default function ArtifactCharacterCard({
	artifact,
	tier,
	rating,
	subStat,
	sx,
	...props
}: {
	artifact: IArtifact;
	tier: Tier;
	rating: number;
	subStat: number;
} & PaperProps) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);

	const currentArtifact = artifacts.find(
		({ location, slotKey }) => location === tier.key && slotKey === artifact.slotKey,
	);
	const currentArtifactTier = getArtifactTier(tier, currentArtifact);

	return (
		<Paper sx={{ p: 1, ...sx }} {...props}>
			<Stack position='relative' direction='row'>
				<CharacterImage character={data.characters[tier.key]} size={80} />
				{currentArtifact && (
					<Fragment>
						<ArtifactImage
							hideCharacter
							hideLevel
							artifact={currentArtifact}
							size={30}
							sx={{
								position: 'absolute',
								border: 1,
								borderColor: 'white',
								top: 50,
								left: 50,
							}}
						/>
						<Box width='100%' ml={1}>
							<Typography>{statName[currentArtifact.mainStatKey]}</Typography>
							{currentArtifact.substats.map((substat) => (
								<SubStatBar
									key={substat.key}
									substat={substat}
									rarity={currentArtifact.rarity}
								/>
							))}
						</Box>
					</Fragment>
				)}
			</Stack>
			<Grid container>
				<Grid item xs={6}>
					New
					<PercentBar p={rating} />
					<PercentBar p={subStat} />
				</Grid>
				{currentArtifact && (
					<Grid item xs={6}>
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
		</Paper>
	);
}
