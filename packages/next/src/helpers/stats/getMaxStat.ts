import { type StatKey } from '../../types/good';
import makeArray from '../makeArray';
import { convertCD } from './convertCD';

export function getMaxStat(subStatArr: (StatKey | StatKey[])[], mainStat: StatKey) {
	let count = 0;
	let max = 0;
	const subStats = convertCD(subStatArr);
	for (let tier = 0; tier < subStats.length; tier++) {
		const statArr = makeArray(subStats[tier]).filter((stat) => stat !== mainStat);
		for (let i = 0; i < statArr.length; i++) {
			if (count >= 4) break;
			max += (1 - Math.min(4, tier) * 0.2) / (count ? 6 : 1);
			count++;
		}
	}
	return max;
}
