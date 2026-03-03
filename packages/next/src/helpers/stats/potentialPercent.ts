import { artifactSetsInfo } from '@/api/artifacts';
import { buildsList } from '@/api/builds';
import { statsAverage, statsMax } from '@/api/stats';
import { sumBy } from 'remeda';
import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
import getFirst from '../getFirst';
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

	const stats = sumBy(
		substats,
		({ key, value }) =>
			((value + statsAverage[key][artifact.rarity] * (rolls / 4)) *
				weightedMultiplier(build.subStat, key)) /
			statsMax[key],
	);
	const rarityMultiplier = artifact.rarity === artifactSetsInfo[artifact.setKey].rarity ? 1 : 0.75;

	return 0.01 + (stats / getMaxStat(build.subStat, artifact.mainStatKey)) * rarityMultiplier;
}

export function maxPotentialPercent(artifact: IArtifact, builds: Build[] = buildsList) {
	const setKey = artifact.setKey;
	return Math.max(
		...builds
			.filter(({ artifact }) => getFirst(artifact) === setKey)
			.map((build) => potentialPercent(build, artifact)),
		0,
	);
}
