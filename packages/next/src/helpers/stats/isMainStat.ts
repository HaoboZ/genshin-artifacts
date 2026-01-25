import { type Build } from '../../types/data';
import { type IArtifact } from '../../types/good';
import getFirst from '../getFirst';
import { statArrMatch } from './statArrMatch';

export default function isMainStat(build: Build, artifact: IArtifact, exact?: boolean) {
	if (!build || !artifact) return false;
	if (artifact.slotKey === 'flower' || artifact.slotKey === 'plume') return true;
	return statArrMatch(getFirst(build.mainStat[artifact.slotKey]), artifact.mainStatKey, exact);
}
