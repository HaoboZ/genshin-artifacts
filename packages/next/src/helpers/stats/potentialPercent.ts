import { statsAverage, statsMax } from '@/api/stats';
import { sumBy } from 'remeda';
import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
import { getMaxStat } from './getMaxStat';
import isMainStat from './isMainStat';
import { weightedMultiplier } from './weightedMultiplier';

export function potentialPercent(build: Build, artifact: IArtifact) {
	if (!isMainStat(build, artifact)) return 0;

	const rolls =
		Math.ceil((artifact.rarity * 4 - artifact.level) / 4) -
		(4 - artifact.substats.length) -
		(artifact.unactivatedSubstats?.length ?? 0);

	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];

	return (
		sumBy(
			substats,
			({ key, value }) =>
				((value + statsAverage[key][artifact.rarity] * (rolls / 4)) *
					weightedMultiplier(build.subStat, key)) /
				statsMax[key],
		) / getMaxStat(build.subStat, artifact.mainStatKey)
	);
}
