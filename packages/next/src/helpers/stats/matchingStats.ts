import { flat } from 'remeda';
import type { Build } from '../../types/data';
import type { IArtifact } from '../../types/good';
import { statArrMatch } from './statArrMatch';

export function matchingStats(build: Build, artifact: IArtifact) {
	const substats = [...artifact.substats, ...(artifact.unactivatedSubstats ?? [])];
	const buildSubstats = flat(build.subStat);

	return [
		substats.reduce((total, { key }) => total + (statArrMatch(buildSubstats, key) ? 1 : 0), 0),
		buildSubstats.reduce((total, substat) => total + (substat === 'critRD_' ? 2 : 1), 0),
	];
}
