import type { StatKey } from '../../types/good';
import arrDeepIndex from '../arrDeepIndex';
import { convertCD } from './convertCD';

export function weightedMultiplier(subStatArr: (StatKey | StatKey[])[], subStat: StatKey) {
	if (!subStat) return 0;

	const statTier = arrDeepIndex(convertCD(subStatArr), subStat);
	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}
