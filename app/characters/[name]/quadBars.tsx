import PercentBar from '@/components/percentBar';
import { Grid } from '@mui/joy';

export default function QuadBars({
	artifactTier,
}: {
	artifactTier: {
		rating: number;
		rarity: boolean;
		mainStat: boolean;
		subStat: number;
	};
}) {
	return (
		<Grid container xs={12} spacing={0}>
			<Grid xs={6}>
				<PercentBar p={artifactTier.rating}>Set: %p</PercentBar>
			</Grid>
			<Grid xs={6}>
				<PercentBar p={+artifactTier.rarity}>Rarity: %p</PercentBar>
			</Grid>
			<Grid xs={6}>
				<PercentBar p={+artifactTier.mainStat}>MainStat: %p</PercentBar>
			</Grid>
			<Grid xs={6}>
				<PercentBar p={artifactTier.subStat}>SubStat: %p</PercentBar>
			</Grid>
		</Grid>
	);
}
