import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import type { BuildEntry, BuildOverridesFile, DiscoveredRoles, ScrapedBuild } from './types';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BUILDS_JSON = resolve(HERE, '../../next/public/data/builds.json');
export const BUILD_OVERRIDES_JSON = resolve(HERE, './buildOverrides.json');

export function loadExistingBuilds(): Record<string, ScrapedBuild | ScrapedBuild[]> {
	if (!existsSync(BUILDS_JSON)) return {};
	try {
		const parsed = JSON.parse(readFileSync(BUILDS_JSON, 'utf8')) as Record<
			string,
			ScrapedBuild | ScrapedBuild[]
		>;
		delete parsed['@lastUpdated'];
		return parsed;
	} catch (error) {
		console.warn(`Failed to read existing builds.json — starting from scratch: ${error}`);
		return {};
	}
}

export async function writeBuilds(
	builds: Record<string, ScrapedBuild | ScrapedBuild[]>,
	existing: Record<string, ScrapedBuild | ScrapedBuild[]>,
) {
	const final = normalizeBuilds({
		'@lastUpdated': new Date().toISOString().slice(0, 10),
		...existing,
		...builds,
	});
	const config = await prettier.resolveConfig(BUILDS_JSON);
	const formatted = await prettier.format(JSON.stringify(final), {
		...config,
		filepath: BUILDS_JSON,
	});
	writeFileSync(BUILDS_JSON, formatted);
	console.info(`Wrote ${Object.keys(builds).length} builds to ../next/public/data/builds.json`);
}

function normalizeBuilds(
	builds: Record<string, string | ScrapedBuild | ScrapedBuild[]>,
): Record<string, string | ScrapedBuild | ScrapedBuild[]> {
	return Object.fromEntries(
		Object.entries(builds).map(([key, value]) => [
			key,
			typeof value === 'string'
				? value
				: Array.isArray(value)
					? value.map(normalizeBuild)
					: normalizeBuild(value),
		]),
	);
}

function normalizeBuild(build: ScrapedBuild): ScrapedBuild {
	return {
		...build,
		weapon: collapseSingleOuterArray(build.weapon),
		artifact: collapseSingleOuterArray(build.artifact),
		mainStat: {
			sands: collapseSingleOuterArray(build.mainStat.sands),
			goblet: collapseSingleOuterArray(build.mainStat.goblet),
			circlet: collapseSingleOuterArray(build.mainStat.circlet),
		},
		subStat: collapseSingleOuterArray(build.subStat),
		overridden: build.overridden && normalizeOverride(build.overridden),
	};
}

function normalizeOverride(override: BuildEntry): BuildEntry {
	return {
		...override,
		...(override.weapon && { weapon: collapseSingleOuterArray(override.weapon) }),
		...(override.artifact && { artifact: collapseSingleOuterArray(override.artifact) }),
		...(override.mainStat && {
			mainStat: {
				...override.mainStat,
				sands: collapseSingleOuterArray(override.mainStat.sands),
				goblet: collapseSingleOuterArray(override.mainStat.goblet),
				circlet: collapseSingleOuterArray(override.mainStat.circlet),
			},
		}),
		...(override.subStat && { subStat: collapseSingleOuterArray(override.subStat) }),
	};
}

function collapseSingleOuterArray<T>(value: T): T {
	if (!Array.isArray(value) || value.length !== 1 || !Array.isArray(value[0])) return value;
	return value[0] as T;
}

function loadBuildOverridesFromDisk(): BuildOverridesFile {
	if (!existsSync(BUILD_OVERRIDES_JSON)) return {};
	try {
		return JSON.parse(readFileSync(BUILD_OVERRIDES_JSON, 'utf8')) as BuildOverridesFile;
	} catch (error) {
		console.warn(`Failed to read buildOverrides.json — starting from scratch: ${error}`);
		return {};
	}
}

// Synchronize override roles with the scraper's current Best Role panels.
export async function saveDiscoveredRoles(discovered: DiscoveredRoles) {
	const keys = Object.keys(discovered);
	if (keys.length === 0) return;
	const file = loadBuildOverridesFromDisk();
	let added = 0;
	let removed = 0;
	for (const key of keys) {
		file[key] ??= {};
		for (const role of discovered[key]) {
			if (file[key][role] !== undefined) continue;
			file[key][role] = { group: -1 };
			added++;
		}
		for (const role of Object.keys(file[key])) {
			if (role === 'additional' || discovered[key].has(role)) continue;
			delete file[key][role];
			removed++;
		}
		if (Object.keys(file[key]).length === 0) delete file[key];
	}
	if (added === 0 && removed === 0) return;
	const config = await prettier.resolveConfig(BUILD_OVERRIDES_JSON);
	const formatted = await prettier.format(JSON.stringify(file), {
		...config,
		filepath: BUILD_OVERRIDES_JSON,
	});
	writeFileSync(BUILD_OVERRIDES_JSON, formatted);
	console.info(`Added ${added} new role(s) to buildOverrides.json — review and assign overrides.`);
}
