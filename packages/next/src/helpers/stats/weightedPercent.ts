import { artifactSetsInfo } from '@/api/artifacts';
import { statsMax } from '@/api/stats';
import { sumBy } from 'remeda';
import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
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
