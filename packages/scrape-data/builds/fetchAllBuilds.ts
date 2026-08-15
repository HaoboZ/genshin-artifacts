import { applyMerge, getKnownRoles } from './overrides';
import { fetchAllSlugs, fetchBuild, getTravelerElement } from './scraper';
import type { DiscoveredRoles, ScrapedBuild } from './types';
import { saveDiscoveredRoles } from './io';
import { pascalCase } from 'change-case';

export async function fetchAllBuilds(
	slugFilter?: string[],
	existingBuilds: Record<string, ScrapedBuild | ScrapedBuild[]> = {},
): Promise<Record<string, ScrapedBuild | ScrapedBuild[]>> {
	const slugs = slugFilter?.length ? slugFilter : await fetchAllSlugs();
	const isPartialTravelerScrape = Boolean(slugFilter?.some((slug) => getTravelerElement(slug)));
	const out: Record<string, ScrapedBuild | ScrapedBuild[]> = {};
	const discovered: DiscoveredRoles = {};

	for (const slug of slugs) {
		console.info(`Scraping ${slug}...`);
		// Traveler variants collapse into a single `Traveler` build array
		const lookupKey = getTravelerElement(slug) ? 'Traveler' : pascalCase(slug);
		try {
			const { key, builds } = await fetchBuild(slug);
			const travelerElement = getTravelerElement(slug);
			if (isPartialTravelerScrape && travelerElement) {
				const roles = (discovered[key] ??= new Set());
				for (const build of toBuildArray(existingBuilds[key])) roles.add(build.role);
				for (const role of getKnownRoles(key)) roles.add(role);
			}
			const value = applyMerge(key, builds, discovered);
			if (isPartialTravelerScrape && travelerElement) {
				const replaced = replaceTravelerElement(
					out[key] ?? existingBuilds[key],
					value,
					travelerElement,
				);
				if (replaced === undefined) delete out[key];
				else out[key] = replaced;
				continue;
			}
			if (value === null) continue;
			if (out[key] === undefined) {
				out[key] = value;
			} else {
				// Multiple slugs mapped to the same key
				out[key] = mergeBuilds(out[key], value);
			}
		} catch (error) {
			console.error(`Failed to scrape ${slug}:`, error);
			// Preserve any existing entry on scrape failure
			const existing = existingBuilds[lookupKey];
			if (existing) out[lookupKey] = existing;
		}
	}
	await saveDiscoveredRoles(discovered);
	return out;
}

function toBuildArray(value: ScrapedBuild | ScrapedBuild[] | undefined): ScrapedBuild[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function mergeBuilds(
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

function replaceTravelerElement(
	previous: ScrapedBuild | ScrapedBuild[] | undefined,
	next: ScrapedBuild | ScrapedBuild[] | null,
	element: string,
): ScrapedBuild | ScrapedBuild[] | undefined {
	const rolePrefix = `${element} - `;
	const retained = toBuildArray(previous).filter((build) => !build.role.startsWith(rolePrefix));
	if (next === null && retained.length === 0) return undefined;
	if (next === null) return mergeBuilds(retained, retained);
	return mergeBuilds(retained, next);
}
