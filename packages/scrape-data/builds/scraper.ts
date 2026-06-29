import fetchPage from '../fetchPage';
import { requiredText } from '../data/helpers';
import { nameToKey } from './utils';
import { parseArtifactSets, parseMainStats, parseSubStats, parseWeapons } from './parsers';
import type { ScrapedBuild } from './types';
import { pascalCase } from 'change-case';

const BASE = 'https://genshin-impact-helper-team.github.io/genshin-builds/en';
const NON_CHARACTER_SLUGS = new Set(['artifacts', 'weapons', 'credits', 'faq', 'changelog']);

// Scrape a single character's build page
export async function fetchBuild(slug: string): Promise<{
	key: string;
	builds: ScrapedBuild[] | null;
}> {
	const dom = await fetchPage(`${BASE}/${slug}`, {
		waitForSelector: '.build-card',
	});
	const document_ = dom.window.document;

	const name = requiredText(
		document_.querySelector('h1#character-title'),
		`character name for ${slug}`,
	).trim();
	// Traveler variant pages all collapse into a single `Traveler` build array.
	// The element (Anemo/Dendro/...) goes into the role prefix so roles stay unique
	// within the shared `Traveler` block; everything else reads normally.
	const travelerElement = getTravelerElement(slug);
	const key = travelerElement ? 'Traveler' : nameToKey(name);

	const panels = [...document_.querySelectorAll('section.build-card')].filter((p) =>
		isBestRoleTab(document_, p),
	);
	// No "Best Role" tab for this character — skip it without adding a build or logging an error.
	if (panels.length === 0) return { key, builds: null };

	const builds: ScrapedBuild[] = [];
	for (const panel of panels) {
		const baseRole = findRoleForPanel(document_, panel);
		const role = travelerElement ? `${travelerElement} - ${baseRole}` : baseRole;
		builds.push({
			key,
			role,
			weapon: collapseSingleGroup(parseWeapons(panel)),
			artifact: collapseSingleGroup(parseArtifactSets(panel)),
			mainStat: parseMainStats(panel),
			subStat: parseSubStats(panel),
		});
	}
	return { key, builds };
}

export async function fetchAllSlugs(): Promise<string[]> {
	const dom = await fetchPage(BASE, {
		waitForSelector: 'a[href*="/genshin-builds/en/"]',
	});
	const slugs = new Set<string>();
	for (const a of dom.window.document.querySelectorAll('a[href*="/genshin-builds/en/"]')) {
		const m = a.getAttribute('href')?.match(/\/genshin-builds\/en\/([a-z0-9-]+)/);
		if (!m) continue;
		const slug = m[1];
		if (NON_CHARACTER_SLUGS.has(slug)) continue;
		slugs.add(slug);
	}
	return [...slugs];
}

export function getTravelerElement(slug: string): string | null {
	const m = slug.match(/^(anemo|dendro|electro|geo|hydro|pyro)-traveler$/);
	return m ? pascalCase(m[1]) : null;
}

function collapseSingleGroup<T extends string>(groups: (T | T[])[]): (T | T[])[] {
	if (groups.length === 1 && Array.isArray(groups[0])) return groups[0];
	return groups;
}

function findRoleForPanel(document_: Document, panel: Element): string {
	const id = panel.getAttribute('data-id');
	if (!id) throw new Error('build-card is missing data-id');
	const button = document_.querySelector(`button.build-switcher-button[data-id="${id}"]`);
	return requiredText(
		button?.querySelector('.build-switcher-name'),
		`role label for ${id}`,
	).trim();
}

function isBestRoleTab(document_: Document, panel: Element): boolean {
	const id = panel.getAttribute('data-id');
	if (!id) return false;
	const button = document_.querySelector(`button.build-switcher-button[data-id="${id}"]`);
	return button?.querySelector('.build-badge')?.textContent?.trim() === 'Best Role';
}
