import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import strArrMatch from '@/src/helpers/strArrMatch';
import type { Tier } from '@/src/types/data';
import type { IArtifact } from '@/src/types/good';
import { artifactSetsInfo, rarityWeight, statsAdd, statsMax } from './artifactData';

export default function getArtifactTier(
	tier: Tier,
	artifact: IArtifact,
): { rating: number; rarity: boolean; mainStat: boolean; subStat: number } {
	if (!tier || !artifact) return { rating: 0, rarity: false, mainStat: false, subStat: 0 };

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

	const statTier = arrDeepIndex(
		subStatArr.map((subStat: string | string[]) => {
			if (typeof subStat === 'string') {
				if (subStat === 'critRD_') return ['critRate_', 'critDMG_'];
			} else {
				const index = subStat.indexOf('critRD_');
				if (index !== -1) return subStat.toSpliced(index, 1, 'critRate_', 'critDMG_');
			}
			return subStat;
		}),
		subStat,
	);
	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}

export function getPotentialTier(tier: Tier, artifact: IArtifact) {
	const artifactTier = getArtifactTier(tier, artifact);

	if (!tier || !artifact) return { ...artifactTier, potential: 0 };

	const rolls =
		Math.ceil((artifact.rarity * 4 - artifact.level) / 4) - (4 - artifact.substats.length);

	return {
		...artifactTier,
		potential: artifactTier.mainStat
			? artifact.substats.reduce(
					(current, { key, value }) =>
						current +
						(getWeightedTier(tier.subStat, key) *
							(value + (rolls / 4) * statsAdd[key][artifact.rarity])) /
							statsMax[key][artifact.rarity],
					0,
				) / rarityWeight[artifact.rarity]
			: 0,
	};
}
