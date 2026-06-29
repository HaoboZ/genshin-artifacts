import { applyMerge } from './overrides';
import { fetchAllSlugs, fetchBuild, getTravelerElement } from './scraper';
import type { DiscoveredRoles, ScrapedBuild } from './types';
import { saveDiscoveredRoles } from './io';
import { pascalCase } from 'change-case';

export async function fetchAllBuilds(
	slugFilter?: string[],
	existingBuilds: Record<string, ScrapedBuild | ScrapedBuild[]> = {},
): Promise<Record<string, ScrapedBuild | ScrapedBuild[]>> {
	const slugs = slugFilter?.length ? slugFilter : await fetchAllSlugs();
	const out: Record<string, ScrapedBuild | ScrapedBuild[]> = {};
	const discovered: DiscoveredRoles = {};

	for (const slug of slugs) {
		console.info(`Scraping ${slug}...`);
		// Traveler variants collapse into a single `Traveler` build array — use that
		// key for the existing-builds lookup so hand-edited groups survive re-scrapes.
		const lookupKey = getTravelerElement(slug) ? 'Traveler' : pascalCase(slug);
		try {
			const existing = existingBuilds[lookupKey];
			const { key, builds } = await fetchBuild(slug);
			const value = applyMerge(key, builds, existing, discovered);
			if (value === null) continue;
			if (out[key] === undefined) {
				out[key] = value;
			} else {
				// Multiple slugs mapped to the same key — only happens for traveler
				// variants. Merge into one array and re-stamp `buildIndex` so positions
				// stay sequential (and position 0 has no `buildIndex`, matching the
				// existing multi-role convention).
				const prev = Array.isArray(out[key]) ? out[key] : [out[key]];
				const next = Array.isArray(value) ? value : [value];
				out[key] = [...prev, ...next].map((b, i) =>
					i === 0 ? { ...b, buildIndex: undefined } : { ...b, buildIndex: i },
				);
			}
		} catch (error) {
			console.error(`Failed to scrape ${slug}:`, error);
			// Preserve any existing entry on scrape failure — the data is already in
			// builds.json, no need to drop it because of a transient network/site error.
			const existing = existingBuilds[lookupKey];
			if (existing) out[lookupKey] = existing;
		}
	}
	saveDiscoveredRoles(discovered);
	return out;
}
