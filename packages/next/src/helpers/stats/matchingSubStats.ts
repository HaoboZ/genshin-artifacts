import { sumBy } from 'remeda';
import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
import isMainStat from './isMainStat';
import { statArrMatch } from './statArrMatch';

export function matchingSubStats(build: Build, artifact: IArtifact) {
	if (!isMainStat(build, artifact, true)) return [0, 1];

	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];
	const buildSubstats = build.subStat.flat();

	return [
		sumBy(substats, ({ key }) => (statArrMatch(buildSubstats, key) ? 1 : 0)),
		sumBy(buildSubstats, (substat) => {
			if (substat === artifact.mainStatKey) return 0;
			return substat === 'critRD_' ? 2 : 1;
		}),
	];
}
