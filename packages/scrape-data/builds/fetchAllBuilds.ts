import { applyMerge } from './utils/applyMerge';
import { fetchBuild } from './fetchBuild';
import { getBuildKey } from './utils/getBuildKey';
import type { DiscoveredRoles, ScrapedBuild } from './types';
import { saveDiscoveredRoles } from './io';
import { mergeBuilds } from './utils/mergeBuilds';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = resolve(HERE, '../genshin-builds/src/content');

export async function fetchAllBuilds(
	existingBuilds: Record<string, ScrapedBuild | ScrapedBuild[]> = {},
): Promise<Record<string, ScrapedBuild | ScrapedBuild[]>> {
	const slugs = await fetchAllSlugs();
	const out: Record<string, ScrapedBuild | ScrapedBuild[]> = {};
	const discovered: DiscoveredRoles = {};

	for (const slug of slugs) {
		console.info(`Reading ${slug}...`);
		// Traveler variants collapse into a single `Traveler` build array
		const lookupKey = getBuildKey(slug);
		try {
			const { key, builds } = await fetchBuild(slug);
			const value = applyMerge(key, builds, discovered);
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

async function fetchAllSlugs(): Promise<string[]> {
	const slugs: string[] = [];
	for (const element of readdirSync(CONTENT, { withFileTypes: true })) {
		if (!element.isDirectory() || element.name === 'site') continue;
		for (const rarity of readdirSync(join(CONTENT, element.name), { withFileTypes: true })) {
			if (!rarity.isDirectory()) continue;
			for (const character of readdirSync(join(CONTENT, element.name, rarity.name), {
				withFileTypes: true,
			})) {
				const path = join(CONTENT, element.name, rarity.name, character.name);
				if (!character.isDirectory() || !existsSync(join(path, 'metadata.json'))) continue;
				slugs.push(character.name === 'traveler' ? `${element.name}-traveler` : character.name);
			}
		}
	}
	return [...new Set(slugs)];
}
