import type { Build } from '../../types/data';
import type { IArtifact } from '../../types/good';
import makeArray from '../makeArray';
import { potentialPercent } from './potentialPercent';

export function maxPotentialPercents(builds: Build[], artifact: IArtifact) {
	const setKey = artifact.setKey;
	return builds
		.filter(({ artifact }) => makeArray(artifact[0])[0] === setKey)
		.map((build) => potentialPercent(build, artifact))
		.reduce((a, b) => (a > b ? a : b), 0);
}
