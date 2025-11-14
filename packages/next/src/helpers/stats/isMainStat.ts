import type { Build } from '../../types/data';
import type { IArtifact } from '../../types/good';
import makeArray from '../makeArray';
import { statArrMatch } from './statArrMatch';

export default function isMainStat(build: Build, artifact: IArtifact, exact?: boolean) {
	if (!build || !artifact) return false;
	if (artifact.slotKey === 'flower' || artifact.slotKey === 'plume') return true;
	return statArrMatch(makeArray(build.mainStat[artifact.slotKey])[0], artifact.mainStatKey, exact);
}
