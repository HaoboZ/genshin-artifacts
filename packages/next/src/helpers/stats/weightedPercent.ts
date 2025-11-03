import { artifactSetsInfo } from '@/api/artifacts';
import { statsMax } from '@/api/stats';
import type { Build } from '../../types/data';
import type { IArtifact } from '../../types/good';
import makeArray from '../makeArray';
import { getMaxStat } from './getMaxStat';
import { statArrMatch } from './statArrMatch';
import { weightedMultiplier } from './weightedMultiplier';

export function weightedPercent(build: Build, artifact: IArtifact) {
	if (!build || !artifact) return 0;
	if (
		artifact.slotKey !== 'flower' &&
		artifact.slotKey !== 'plume' &&
		!statArrMatch(makeArray(build.mainStat[artifact.slotKey])[0], artifact.mainStatKey)
	)
		return 0;

	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];

	return (
		(substats.reduce(
			(current, { key, value }) =>
				current + (value * weightedMultiplier(build.subStat, key)) / statsMax[key],
			0,
		) /
			getMaxStat(build.subStat, artifact.mainStatKey)) *
		(artifact.rarity === artifactSetsInfo[artifact.setKey].rarity ? 1 : 0.75)
	);
}
