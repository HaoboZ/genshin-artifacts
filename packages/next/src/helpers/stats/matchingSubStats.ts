import { flat } from 'remeda';
import type { Build } from '../../types/data';
import type { IArtifact } from '../../types/good';
import isMainStat from './isMainStat';
import { statArrMatch } from './statArrMatch';

export function matchingSubStats(build: Build, artifact: IArtifact) {
	if (!isMainStat(build, artifact)) return [0, 1];

	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];
	const buildSubstats = flat(build.subStat);

	return [
		substats.reduce((total, { key }) => total + (statArrMatch(buildSubstats, key) ? 1 : 0), 0),
		buildSubstats.reduce((total, substat) => {
			if (substat === artifact.mainStatKey) return total;
			return total + (substat === 'critRD_' ? 2 : 1);
		}, 0),
	];
}
