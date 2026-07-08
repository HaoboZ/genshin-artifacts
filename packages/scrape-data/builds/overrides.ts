import buildOverrides from './buildOverrides.json';
import type { BuildEntry, BuildOverridesFile, DiscoveredRoles, ScrapedBuild } from './types';

const buildOverridesTyped = buildOverrides as BuildOverridesFile;

// Resolve the configuration entry for `(key, role)`
export function resolveGroupEntry(key: string, role: string): BuildEntry | undefined {
	const roles = buildOverridesTyped[key];
	if (!roles) return undefined;
	if (role === 'additional') return undefined;
	const raw = roles[role];
	if (raw === undefined) return undefined;
	if (Array.isArray(raw)) return undefined;
	return typeof raw === 'number' ? { group: raw } : raw;
}

// Apply buildOverrides entry to a scraped build
export function applyGroupEntry(
	scraped: ScrapedBuild,
	entry: BuildEntry | undefined,
): ScrapedBuild | null {
	if (entry?.omit) return null;

	scraped.overridden = {};
	if (entry?.role) {
		scraped.overridden.role = scraped.role;
		scraped.role = entry.role;
	}
	if (entry?.weapon) {
		scraped.overridden.weapon = scraped.weapon;
		scraped.weapon = entry.weapon;
	}
	if (entry?.artifact) {
		scraped.overridden.artifact = scraped.artifact;
		scraped.artifact = entry.artifact;
	}
	if (entry?.mainStat) {
		scraped.overridden.mainStat = scraped.mainStat;
		scraped.mainStat = entry.mainStat;
	}
	if (entry?.subStat) {
		scraped.overridden.subStat = scraped.subStat;
		scraped.subStat = entry.subStat;
	}

	if (!Object.keys(scraped.overridden).length) {
		delete scraped.overridden;
	}
	return { ...scraped, group: entry?.group ?? -1 };
}

// Append the user-defined `additional` builds from buildOverrides.json
function applyAdditionalBuilds(key: string, out: ScrapedBuild[]): void {
	const additional = buildOverridesTyped[key]?.additional;
	if (!additional?.length) return;
	for (const build of additional) out.push(build);
}

// Merge a freshly scraped build list with the buildOverrides configuration
export function applyMerge(
	key: string,
	builds: ScrapedBuild[] | null,
	discovered: DiscoveredRoles,
): ScrapedBuild | ScrapedBuild[] | null {
	const merged: ScrapedBuild[] = [];
	for (const scraped of builds ?? []) {
		const entry = resolveGroupEntry(key, scraped.role);
		// Record this role for buildOverrides auto-population if it's not already configured.
		if (entry === undefined) {
			(discovered[key] ??= new Set()).add(scraped.role);
		}
		const final = applyGroupEntry(scraped, entry);
		if (!final) continue; // entry.omit
		merged.push(final);
	}

	applyAdditionalBuilds(key, merged);

	if (merged.length === 0) return null;
	for (let i = 1; i < merged.length; i++) {
		merged[i].buildIndex = i;
	}
	return merged.length === 1 ? merged[0] : merged;
}
