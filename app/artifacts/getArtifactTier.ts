import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import strArrMatch from '@/src/helpers/strArrMatch';
import type { Tier } from '@/src/types/data';
import type { IArtifact } from '@/src/types/good';
import { artifactSetsInfo, rarityWeight, statsMax } from './artifactData';

export default function getArtifactTier(
	tier: Tier,
	artifact: IArtifact,
): { rating: number; rarity: boolean; mainStat: boolean; subStat: number } {
	if (!artifact) return { rating: 0, rarity: false, mainStat: false, subStat: 0 };

	const artifactIndex = arrDeepIndex(tier.artifact, artifact.setKey);

	return {
		rating: artifactIndex === -1 ? 0 : 1 - artifactIndex / tier.artifact.length,
		rarity: artifact.rarity === artifactSetsInfo[artifact.setKey].rarity,
		mainStat: strArrMatch(tier.mainStat[artifact.slotKey], artifact.mainStatKey),
		subStat:
			artifact.substats.reduce(
				(current, { key, value }) =>
					current +
					(getWeightedTier(tier.subStat, key) * value) / statsMax[key][artifact.rarity],
				0,
			) / rarityWeight[artifact.rarity],
	};
}

function getWeightedTier(subStatArr, subStat) {
	if (!subStat) return 0;
	const statTier = arrDeepIndex(subStatArr, subStat);

	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}
