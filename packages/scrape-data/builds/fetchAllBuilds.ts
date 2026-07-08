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
		// Traveler variants collapse into a single `Traveler` build array
		const lookupKey = getTravelerElement(slug) ? 'Traveler' : pascalCase(slug);
		try {
			const { key, builds } = await fetchBuild(slug);
			const value = applyMerge(key, builds, discovered);
			if (value === null) continue;
			if (out[key] === undefined) {
				out[key] = value;
			} else {
				// Multiple slugs mapped to the same key
				const prev = Array.isArray(out[key]) ? out[key] : [out[key]];
				const next = Array.isArray(value) ? value : [value];
				out[key] = [...prev, ...next].map((b, i) =>
					i === 0 ? { ...b, buildIndex: undefined } : { ...b, buildIndex: i },
				);
			}
		} catch (error) {
			console.error(`Failed to scrape ${slug}:`, error);
			// Preserve any existing entry on scrape failure
			const existing = existingBuilds[lookupKey];
			if (existing) out[lookupKey] = existing;
		}
	}
	saveDiscoveredRoles(discovered);
	return out;
}
