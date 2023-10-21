import PercentBar, { combinePercents } from '@/components/percentBar';
import { data } from '@/src/resources/data';
import type { Tier } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { Box } from '@mui/joy';
import ArtifactImage from '../artifacts/artifactImage';
import getArtifactTier from '../artifacts/getArtifactTier';

export default function CharactersArtifact({
	type,
	artifact,
	tier,
}: {
	type: SlotKey;
	artifact: IArtifact;
	tier: Tier;
}) {
	const { rating, rarity, mainStat, subStat } = getArtifactTier(tier, artifact);

	return (
		<Box>
			<ArtifactImage artifactSet={data.artifacts[artifact?.setKey]} type={type} />
			<PercentBar
				p={combinePercents(
					{ weight: 4 / 12, percent: rating },
					{ weight: 2 / 12, percent: +rarity },
					{ weight: 2 / 12, percent: +mainStat },
					{ weight: 4 / 12, percent: subStat },
				)}
			/>
		</Box>
	);
}
