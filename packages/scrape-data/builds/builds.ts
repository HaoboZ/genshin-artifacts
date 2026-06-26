import { pascalCase } from 'change-case';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fetchPage from '../fetchPage';
import { requiredText } from '../data/helpers';
import buildOverrides from './buildOverrides.json';

const HERE = dirname(fileURLToPath(import.meta.url));

// Shape of one per-role entry inside `buildOverrides.json`. Number values are accepted as a
// shorthand for `{ group: N }`. See `resolveGroupEntry` for the runtime handling.
type BuildGroupEntry = {
	omit?: true;
	role?: string;
	weapon?: (string | string[])[];
	artifact?: (string | string[])[];
	mainStat?: {
		sands: string | string[];
		goblet: string | string[];
		circlet: string | string[];
	};
	subStat?: (string | string[])[];
	group?: number;
};
type BuildOverridesFile = Record<string, Record<string, BuildGroupEntry | number>>;

const buildOverridesTyped = buildOverrides as BuildOverridesFile;

const BASE = 'https://genshin-impact-helper-team.github.io';
const NON_CHARACTER_SLUGS = new Set(['artifacts', 'weapons', 'credits', 'faq', 'changelog']);

type WeaponGroup = string | string[];
type ArtifactGroup = string | string[];

type ScrapedBuild = {
	key: string;
	role: string;
	weapon: WeaponGroup[];
	artifact: ArtifactGroup[];
	mainStat: {
		sands: string | string[];
		goblet: string | string[];
		circlet: string | string[];
	};
	subStat: (string | string[])[];
	group?: number;
	buildIndex?: number;
	overridden?: BuildGroupEntry;
};

function decodeHtmlEntities(text: string) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(+code))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.trim();
}

const STAT_MAP: Record<string, string> = {
	'HP': 'hp',
	'HP%': 'hp_',
	'Flat HP': 'hp',
	'ATK': 'atk',
	'ATK%': 'atk_',
	'Flat ATK': 'atk',
	'DEF': 'def',
	'DEF%': 'def_',
	'Flat DEF': 'def',
	'Elemental Mastery': 'eleMas',
	'Energy Recharge': 'enerRech_',
	'Healing Bonus': 'heal_',
	'CRIT Rate': 'critRate_',
	'CRIT DMG': 'critDMG_',
	'CRIT Rate / CRIT DMG': 'critRD_',
	'Physical DMG': 'physical_dmg_',
	'Anemo DMG': 'anemo_dmg_',
	'Geo DMG': 'geo_dmg_',
	'Electro DMG': 'electro_dmg_',
	'Hydro DMG': 'hydro_dmg_',
	'Pyro DMG': 'pyro_dmg_',
	'Cryo DMG': 'cryo_dmg_',
	'Dendro DMG': 'dendro_dmg_',
};

function mapStat(label: string): string {
	const key = STAT_MAP[label];
	if (!key) throw new Error(`Unknown stat label: ${JSON.stringify(label)}`);
	return key;
}

// Split a stat cell by " / " (the site's alternative-separator) and translate to StatKey.
// "CRIT Rate / CRIT DMG" — the canonical combined stat — collapses into a single `critRD_`.
function mapStatAlternatives(labels: string[]): string[] {
	const flat = labels.flatMap((l) => l.split(/\s*\/\s*/));
	const out: string[] = [];
	for (let i = 0; i < flat.length; i++) {
		if (flat[i] === 'CRIT Rate' && flat[i + 1] === 'CRIT DMG') {
			out.push('critRD_');
			i++;
		} else {
			out.push(mapStat(flat[i]));
		}
	}
	return out;
}

// Read the visible item name from inside an info-popover-trigger, stripping the note-link
// marker (ⓘ) and any artifact-piece-suffix ("(4)"). Returns the trimmed, decoded text.
function readItemName(row: Element): string {
	const trigger = row.querySelector('.info-popover-trigger');
	if (!trigger) {
		// Fallback for sub-stat rows that don't have an info-popover wrapper.
		const label = row.querySelector('.inline-note-label');
		if (label) return decodeHtmlEntities((label as HTMLElement).textContent ?? '').trim();
		return '';
	}
	// Clone so we can mutate without affecting the document.
	const clone = trigger.cloneNode(true) as HTMLElement;
	for (const note of clone.querySelectorAll('.note-link, .artifact-piece-suffix')) note.remove();
	return decodeHtmlEntities(clone.textContent ?? '').trim();
}

function nameToKey(name: string): string {
	// Site uses Unicode apostrophes and dashes that pascalCase does not handle — normalize first.
	const normalized = name
		.replaceAll('’', "'")
		.replaceAll('‘', "'")
		.replaceAll('–', '-')
		.replaceAll('—', '-');
	return pascalCase(normalized.replaceAll("'", ''));
}

// When the entire list is a single multi-option group (e.g. `[["A","B"]]`), unwrap it to a
// flat list (`["A","B"]`). With only one group there's no priority ordering to preserve —
// just the set of alternatives — so the extra nesting is noise.
function collapseSingleGroup<T extends string>(groups: (T | T[])[]): (T | T[])[] {
	if (groups.length === 1 && Array.isArray(groups[0])) return groups[0];
	return groups;
}

function parseWeapons(card: Element): WeaponGroup[] {
	const groups: WeaponGroup[] = [];
	for (const groupEl of card.querySelectorAll('.weapon-card .rank-list .rank-group')) {
		const rows = [...groupEl.querySelectorAll(':scope > .rank-row')];
		const primary = rows.find((r) => !r.classList.contains('alt'));
		if (!primary) continue;
		const names = [primary, ...rows.filter((r) => r.classList.contains('alt'))]
			.map(readItemName)
			.filter(Boolean)
			.map(nameToKey);
		if (names.length === 0) continue;
		groups.push(names.length === 1 ? names[0] : names);
	}
	return groups;
}

// Some sites (e.g. Columbina) wrap the 2-piece placeholder rows as the *primary* rank-row
// (no `.info-popover-trigger`, just a `.inline-note-label` like "+20% HP set"). We detect
// these by the presence of a `[Choose Two]` marker anywhere in the row's descendants —
// that's the convention the community-builds site uses for "pick any two 2-piece sets".
function isChooseTwoRow(row: Element): boolean {
	return row.querySelector('.accent-text')?.textContent?.trim() === '[Choose Two]';
}

// Read every real set named in an artifact rank-row. A row can list several alternatives
// separated by " / " — each is its own `.info-popover-trigger`. We skip any trigger whose
// piece-suffix is "(2)": those are 2-piece combo placeholders (e.g. "Noblesse Oblige (2) /
// Blizzard Strayer (2)"), not standalone 4-piece set recommendations. This intentionally
// reads `.alt` rows too — an alt can be a genuine 4-piece alternative (e.g. Aloy lists
// Scroll of the Hero of Cinder City as an alt to Noblesse Oblige).
function readSetNames(row: Element): string[] {
	const names: string[] = [];
	for (const trigger of row.querySelectorAll('.info-popover-trigger')) {
		if (trigger.querySelector('.artifact-piece-suffix')?.textContent?.includes('(2)')) continue;
		const clone = trigger.cloneNode(true) as HTMLElement;
		for (const note of clone.querySelectorAll('.note-link, .artifact-piece-suffix'))
			note.remove();
		const name = decodeHtmlEntities(clone.textContent ?? '').trim();
		if (name) names.push(nameToKey(name));
	}
	return names;
}

function parseArtifactSets(card: Element): ArtifactGroup[] {
	const setsCard = card.querySelector('.artifact-sets-card');
	if (!setsCard) return [];

	const ranks = [...setsCard.querySelectorAll(':scope .rank-list')];

	// The first rank-list inside `.recommendation-section` is the unconditional priority list.
	// `.conditional-list` (when present) is the second rank-list — those rows collapse into
	// the LAST artifact group, matching the structure of the previous hand-edited data.
	const unconditionalLists = ranks.filter((l) => !l.closest('.conditional-list'));
	const conditionalLists = ranks.filter((l) => l.closest('.conditional-list'));

	const groups: ArtifactGroup[] = [];

	for (const list of unconditionalLists) {
		for (const groupEl of list.querySelectorAll(':scope > .rank-group')) {
			// One rank-group is one priority slot. Gather every real 4-piece set across its
			// rows (primary + alt) — they're alternatives within that slot.
			const names: string[] = [];
			for (const row of groupEl.querySelectorAll(':scope > .rank-row')) {
				if (isChooseTwoRow(row)) continue;
				names.push(...readSetNames(row));
			}
			if (names.length === 0) continue;
			groups.push(names.length === 1 ? names[0] : names);
		}
	}

	if (conditionalLists.length) {
		const condNames: string[] = [];
		for (const list of conditionalLists) {
			for (const row of list.querySelectorAll('.rank-row')) {
				if (isChooseTwoRow(row)) continue;
				condNames.push(...readSetNames(row));
			}
		}
		if (condNames.length) {
			// All conditional sets form a single group appended at the end — they're
			// alternatives to one another, not extensions of the last unconditional set.
			groups.push(condNames.length === 1 ? condNames[0] : condNames);
		}
	}

	return groups;
}

function parseMainStats(card: Element): ScrapedBuild['mainStat'] {
	const statsCard = card.querySelector('.artifact-stats-card');
	const out: ScrapedBuild['mainStat'] = {
		sands: '',
		goblet: '',
		circlet: '',
	};
	if (!statsCard) return out;

	for (const row of statsCard.querySelectorAll('.stat-row')) {
		const slot = requiredText(row.querySelector('strong'), 'artifact stat slot').toLowerCase() as
			| 'sands'
			| 'goblet'
			| 'circlet';
		const labels = [...row.querySelectorAll('.inline-note-label')].map((el) => {
			// Strip the note-link "ⓘ" marker before reading.
			const clone = el.cloneNode(true) as HTMLElement;
			for (const note of clone.querySelectorAll('.note-link')) note.remove();
			return decodeHtmlEntities(clone.textContent ?? '').trim();
		});
		const keys = mapStatAlternatives(labels);
		out[slot] = keys.length === 1 ? keys[0] : keys;
	}
	return out;
}

function parseSubStats(card: Element): (string | string[])[] {
	const statsCard = card.querySelector('.artifact-stats-card');
	if (!statsCard) return [];
	const subSection = [...statsCard.querySelectorAll('.section')].find((s) =>
		s.querySelector('h3')?.textContent?.trim().startsWith('Substats'),
	);
	if (!subSection) return [];

	// Each `.rank-group` is one priority tier. Rows inside it (primary + `.alt` with a
	// `.rank-approx` `≈` marker) are alternatives at the same priority — they collapse into a
	// single slot, matching how `parseArtifactSets` handles artifact-rank alternatives.
	const out: (string | string[])[] = [];
	for (const groupEl of subSection.querySelectorAll(':scope > .rank-list > .rank-group')) {
		const stats: string[] = [];
		for (const row of groupEl.querySelectorAll(':scope > .rank-row')) {
			const label = row.querySelector('.inline-note-label');
			if (!label) continue;
			const clone = label.cloneNode(true) as HTMLElement;
			for (const note of clone.querySelectorAll('.note-link')) note.remove();
			const text = decodeHtmlEntities(clone.textContent ?? '').trim();
			if (!text) continue;
			stats.push(...mapStatAlternatives([text]));
		}
		if (stats.length === 0) continue;
		out.push(stats.length === 1 ? stats[0] : stats);
	}
	return out;
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

// Find the matching existing build by role label. Used to preserve the `group` (and any
// other hand-edited fields) across scrapes when buildOverrides doesn't specify a `group`.
function findExistingBuild(
	existing: ScrapedBuild | ScrapedBuild[] | undefined,
	role: string,
): ScrapedBuild | undefined {
	if (!existing) return undefined;
	if (Array.isArray(existing)) return existing.find((b) => b.role === role);
	return existing.role === role ? existing : undefined;
}

// Resolve the configuration entry for `(key, role)`. Coerces the number shorthand into
// a full `BuildGroupEntry` so callers don't have to handle both shapes.
function resolveGroupEntry(key: string, role: string): BuildGroupEntry | undefined {
	const roles = buildOverridesTyped[key];
	if (!roles) return undefined;
	const raw = roles[role];
	if (raw === undefined) return undefined;
	return typeof raw === 'number' ? { group: raw } : raw;
}

// Apply buildOverrides entry to a scraped build. Returns either the final build, or `null`
// when the entry's `omit: true` flag tells us to drop this build entirely.
function applyGroupEntry(
	scraped: ScrapedBuild,
	entry: BuildGroupEntry | undefined,
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

// Track `(key, role)` pairs the scraper encounters that aren't in buildOverrides.json so we
// can auto-add them after the run. Keyed by character key, each value is a Set of roles.
type DiscoveredRoles = Record<string, Set<string>>;

async function fetchBuild(
	slug: string,
	existing: ScrapedBuild | ScrapedBuild[] | undefined,
	discovered: DiscoveredRoles,
): Promise<{ key: string; value: ScrapedBuild | ScrapedBuild[] | null }> {
	const dom = await fetchPage(`${BASE}/genshin-builds/en/${slug}/`, {
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
	if (panels.length === 0) return { key, value: null };

	const out: ScrapedBuild[] = [];
	panels.forEach((panel) => {
		const baseRole = findRoleForPanel(document_, panel);
		const role = travelerElement ? `${travelerElement} - ${baseRole}` : baseRole;
		const scraped: ScrapedBuild = {
			key,
			role,
			weapon: collapseSingleGroup(parseWeapons(panel)),
			artifact: collapseSingleGroup(parseArtifactSets(panel)),
			mainStat: parseMainStats(panel),
			subStat: parseSubStats(panel),
		};
		const entry = resolveGroupEntry(key, role);
		const existingBuild = findExistingBuild(existing, role);
		// Record this role for buildOverrides auto-population if it's not already configured.
		if (entry === undefined) {
			(discovered[key] ??= new Set()).add(role);
		}
		const final = applyGroupEntry(scraped, entry, existingBuild);
		if (!final) return;
		out.push(final);
	});

	if (out.length === 0) return { key, value: null };
	for (let i = 1; i < out.length; i++) {
		out[i].buildIndex = i;
	}
	const value = out.length === 1 ? out[0] : out;
	return { key, value };
}

async function fetchAllSlugs(): Promise<string[]> {
	const dom = await fetchPage(`${BASE}/genshin-builds/en/`, {
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

const BUILDS_JSON = resolve(HERE, '../../next/public/data/builds.json');
const BUILD_OVERRIDES_JSON = resolve(HERE, './buildOverrides.json');

function slugToKey(slug: string): string {
	// The community-builds site uses lowercase-hyphenated slugs that map directly to
	// the existing CharacterKey union via `pascalCase` of the slug parts. We use this
	// to look up the existing `group` value before the network call returns the
	// authoritative character title.
	return pascalCase(slug);
}

// The Traveler character page is split per element variant on the community-builds
// site (`anemo-traveler`, `dendro-traveler`, ...). In-app, Traveler is a single
// `CharacterKey` — each variant becomes one build inside a single `Traveler` array,
// keyed by role name like `"Anemo - Anemo DPS"`. Returns the element name (e.g.
// `Anemo`) when the slug is a traveler variant, otherwise `null`.
function getTravelerElement(slug: string): string | null {
	const m = slug.match(/^(anemo|dendro|electro|geo|hydro|pyro)-traveler$/);
	return m ? pascalCase(m[1]) : null;
}

// Read buildOverrides.json fresh off disk so we never overwrite a user's hand edits with
// the in-memory copy (which `fetchBuild` may have stale views of).
function loadBuildOverridesFromDisk(): BuildOverridesFile {
	if (!existsSync(BUILD_OVERRIDES_JSON)) return {};
	try {
		return JSON.parse(readFileSync(BUILD_OVERRIDES_JSON, 'utf8')) as BuildOverridesFile;
	} catch (error) {
		console.warn(`Failed to read buildOverrides.json — starting from scratch: ${error}`);
		return {};
	}
}

// Add any roles the scraper encountered that weren't in buildOverrides.json. New entries
// default to `group: -1` so the user can spot them and assign a real group later.
function saveDiscoveredRoles(discovered: DiscoveredRoles): void {
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

export async function fetchAllBuilds(
	slugFilter?: string[],
	existingBuilds: Record<string, ScrapedBuild | ScrapedBuild[]> = {},
): Promise<Record<string, ScrapedBuild | ScrapedBuild[]>> {
	const slugs = slugFilter && slugFilter.length ? slugFilter : await fetchAllSlugs();
	const out: Record<string, ScrapedBuild | ScrapedBuild[]> = {};
	const discovered: DiscoveredRoles = {};
	console.log(existingBuilds);
	for (const slug of slugs) {
		console.info(`Scraping ${slug}...`);
		// Traveler variants collapse into a single `Traveler` build array — use that
		// key for the existing-builds lookup so hand-edited groups survive re-scrapes.
		const lookupKey = getTravelerElement(slug) ? 'Traveler' : slugToKey(slug);
		try {
			const existing = existingBuilds[lookupKey];
			const { key, value } = await fetchBuild(slug, existing, discovered);
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

// When `slugFilter` is provided (a specific subset was requested), merge the new entries
// into the existing JSON instead of replacing the file. Otherwise write the fresh result.
export async function writeBuilds(
	builds: Record<string, ScrapedBuild | ScrapedBuild[]>,
	options: { mergeWithExisting?: boolean } = {},
) {
	const existing = options.mergeWithExisting ? loadExistingBuilds() : {};
	const final = options.mergeWithExisting ? { ...existing, ...builds } : builds;
	writeFileSync(BUILDS_JSON, `${JSON.stringify(final, null, '\t')}\n`);
}
