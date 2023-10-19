import arrDeepIndex from './arrDeepIndex';

export default function getWeightedTier(subStatArr, subStat) {
	if (!subStat) return 0;
	const statTier = arrDeepIndex(subStatArr, subStat);

	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}
