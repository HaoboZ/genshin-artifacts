import type { ScrapedBuild } from '../types';
import { toBuildArray } from './toBuildArray';

export function mergeBuilds(
	previous: ScrapedBuild | ScrapedBuild[] | undefined,
	next: ScrapedBuild | ScrapedBuild[],
): ScrapedBuild | ScrapedBuild[] {
	const merged = new Map(toBuildArray(previous).map((build) => [build.role, build]));
	for (const build of toBuildArray(next)) merged.set(build.role, build);
	const builds = [...merged.values()].map((build, i) =>
		i === 0 ? { ...build, buildIndex: undefined } : { ...build, buildIndex: i },
	);
	return builds.length === 1 ? builds[0] : builds;
}
