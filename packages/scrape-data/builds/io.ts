import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { BuildOverridesFile, DiscoveredRoles, ScrapedBuild } from './types';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BUILDS_JSON = resolve(HERE, '../../next/public/data/builds.json');
export const BUILD_OVERRIDES_JSON = resolve(HERE, './buildOverrides.json');

export function loadExistingBuilds(): Record<string, ScrapedBuild | ScrapedBuild[]> {
	if (!existsSync(BUILDS_JSON)) return {};
	try {
		return JSON.parse(readFileSync(BUILDS_JSON, 'utf8')) as Record<
			string,
			ScrapedBuild | ScrapedBuild[]
		>;
	} catch (error) {
		console.warn(`Failed to read existing builds.json — starting from scratch: ${error}`);
		return {};
	}
}

export function writeBuilds(
	builds: Record<string, ScrapedBuild | ScrapedBuild[]>,
	existing: Record<string, ScrapedBuild | ScrapedBuild[]>,
) {
	const final = { ...existing, ...builds };
	writeFileSync(BUILDS_JSON, `${JSON.stringify(final, null, '\t')}\n`);
	console.info(`Wrote ${Object.keys(builds).length} builds to ../next/public/data/builds.json`);
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

// Add any roles the scraper encountered that weren't in buildOverrides.json
export function saveDiscoveredRoles(discovered: DiscoveredRoles): void {
	const keys = Object.keys(discovered).filter((k) => discovered[k].size > 0);
	if (keys.length === 0) return;
	const file = loadBuildOverridesFromDisk();
	let added = 0;
	for (const key of keys) {
		file[key] ??= {};
		for (const role of discovered[key]) {
			if (file[key][role] !== undefined) continue;
			file[key][role] = { group: -1 };
			added++;
		}
	}
	if (added === 0) return;
	writeFileSync(BUILD_OVERRIDES_JSON, `${JSON.stringify(file, null, '\t')}\n`);
	console.info(`Added ${added} new role(s) to buildOverrides.json — review and assign overrides.`);
}
