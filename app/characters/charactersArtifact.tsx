import PercentBar, { combinePercents } from '@/components/percentBar';
import type { Tier } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import ArtifactImage from '../artifacts/artifactImage';
import getArtifactTier from '../artifacts/getArtifactTier';

export default function CharactersArtifact({
	artifact,
	slot,
	tier,
}: {
	artifact: IArtifact;
	slot: SlotKey;
	tier: Tier;
}) {
	const { rating, rarity, mainStat, subStat } = useMemo(
		() => getArtifactTier(tier, artifact),
		[tier, artifact],
	);

	return (
		<Box>
			<ArtifactImage artifact={artifact} slot={slot} size={50} />
			<PercentBar
				p={
					mainStat &&
					combinePercents(
						{ weight: 3 / 10, percent: rating },
						{ weight: 3 / 10, percent: +rarity },
						{ weight: 3 / 10, percent: subStat },
					)
				}
			/>
		</Box>
	);
}
