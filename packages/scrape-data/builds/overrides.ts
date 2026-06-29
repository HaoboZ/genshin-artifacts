import buildOverrides from './buildOverrides.json';
import type { BuildEntry, BuildOverridesFile, DiscoveredRoles, ScrapedBuild } from './types';

const buildOverridesTyped = buildOverrides as BuildOverridesFile;

// Find the matching existing build by role label
export function findExistingBuild(
	existing: ScrapedBuild | ScrapedBuild[] | undefined,
	role: string,
): ScrapedBuild | undefined {
	if (!existing) return undefined;
	if (Array.isArray(existing)) return existing.find((b) => b.role === role);
	return existing.role === role ? existing : undefined;
}

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
	existing: ScrapedBuild | undefined,
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
	return { ...scraped, group: existing?.group ?? -1 };
}

// Append the user-defined `additional` builds from buildOverrides.json
function applyAdditionalBuilds(key: string, out: ScrapedBuild[]): void {
	const additional = buildOverridesTyped[key]?.additional;
	if (!additional?.length) return;
	for (const build of additional) out.push(build);
}

// Merge a freshly scraped build list with hand-edited `existing` data
export function applyMerge(
	key: string,
	builds: ScrapedBuild[] | null,
	existing: ScrapedBuild | ScrapedBuild[] | undefined,
	discovered: DiscoveredRoles,
): ScrapedBuild | ScrapedBuild[] | null {
	const merged: ScrapedBuild[] = [];
	for (const scraped of builds ?? []) {
		const entry = resolveGroupEntry(key, scraped.role);
		// Record this role for buildOverrides auto-population if it's not already configured.
		if (entry === undefined) {
			(discovered[key] ??= new Set()).add(scraped.role);
		}
		const existingBuild = findExistingBuild(existing, scraped.role);
		const final = applyGroupEntry(scraped, entry, existingBuild);
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
