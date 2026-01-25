import { artifactSetsInfo } from '@/api/artifacts';
import { buildsList } from '@/api/builds';
import { statsMax } from '@/api/stats';
import { sumBy } from 'remeda';
import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
import getFirst from '../getFirst';
import { getMaxStat } from './getMaxStat';
import isMainStat from './isMainStat';
import { weightedMultiplier } from './weightedMultiplier';

export function weightedPercent(build: Build, artifact: IArtifact) {
	if (!isMainStat(build, artifact)) return 0;

	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];

	return (
		(sumBy(
			substats,
			({ key, value }) => (value * weightedMultiplier(build.subStat, key)) / statsMax[key],
		) /
			getMaxStat(build.subStat, artifact.mainStatKey)) *
		(artifact.rarity === artifactSetsInfo[artifact.setKey].rarity ? 1 : 0.75)
	);
}

export function maxWeightedPercent(artifact: IArtifact, builds: Build[] = buildsList) {
	const setKey = artifact.setKey;
	return builds
		.filter(({ artifact }) => getFirst(artifact) === setKey)
		.map((build) => weightedPercent(build, artifact))
		.reduce((a, b) => (a > b ? a : b), 0);
}
