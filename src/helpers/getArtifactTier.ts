import type { Tier } from '../data';
import type { IArtifact } from '../good';
import { data } from '../resources/data';
import { rarityWeight, stats } from '../resources/stats';
import arrDeepIndex from './arrDeepIndex';
import getWeightedTier from './getWeightedTier';
import strArrMatch from './strArrMatch';

export default function getArtifactTier(
	tier: Tier,
	artifact: IArtifact,
): {
	rating: number;
	rarity: boolean;
	mainStat: boolean;
	subStat: number;
} {
	if (!artifact) return { rating: 0, rarity: false, mainStat: false, subStat: 0 };

	const artifactIndex = arrDeepIndex(tier.artifact, artifact.setKey);

	return {
		rating: artifactIndex === -1 ? 0 : 1 - artifactIndex / tier.artifact.length,
		rarity: artifact.rarity === data.artifacts[artifact.setKey].rarity,
		mainStat: strArrMatch(tier.mainStat[artifact.slotKey], artifact.mainStatKey),
		subStat:
			artifact.substats.reduce(
				(current, { key, value }) =>
					current + (getWeightedTier(tier.subStat, key) * value) / stats[key][artifact.rarity],
				0,
			) / rarityWeight[artifact.rarity],
	};
}
