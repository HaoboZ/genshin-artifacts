import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capitalCase, pascalCase } from 'change-case';
import { mapStats } from './mapStats';
import type { ArtifactGroup, ScrapedBuild, WeaponGroup } from './types';
import { getBuildKey } from './utils/getBuildKey';
import { getTravelerElement } from './utils/getTravelerElement';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = resolve(HERE, '../genshin-builds/src/content');
const TRANSLATIONS = {
	...Object.fromEntries(
		['elements', 'stats', 'characters', 'weapons', 'artifact-sets'].map((name) => [
			name === 'artifact-sets' ? 'set' : name.slice(0, -1),
			readJson<Record<string, string>>(
				resolve(HERE, `../genshin-builds/src/i18n/en/${name}.json`),
			),
		]),
	),
	ability: readJson<Record<string, string>>(
		resolve(HERE, '../genshin-builds/src/i18n/en/abilities.json'),
	),
} as Record<string, Record<string, string>>;
const ALIASES = readJson<Record<string, Record<string, string>>>(
	resolve(HERE, '../genshin-builds/src/data/translation-aliases.json'),
);
type Item = string | { name: string; pieces?: number };
type Group = { items?: Item[]; choices?: { items: Item[] }[]; choose?: boolean };
type ConditionalEntry = Group | { groups?: Group[] };

export async function fetchBuild(
	slug: string,
): Promise<{ key: string; builds: ScrapedBuild[] | null }> {
	const character = findCharacter(slug);
	if (!character) throw new Error(`Character source not found for ${slug}`);
	const key = getBuildKey(character.slug);
	const travelerElement = getTravelerElement(slug);
	const builds: ScrapedBuild[] = [];
	for (const entry of readdirSync(character.path, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const buildPath = join(character.path, entry.name);
		const notes = readOptionalJson<{ best?: boolean; name?: { en?: string } }>(
			join(buildPath, 'build-notes.json'),
		);
		if (!notes?.best) continue;
		const baseRole = resolveTokens(notes.name?.en ?? capitalCase(entry.name));
		builds.push({
			key,
			role: travelerElement ? `${travelerElement} - ${baseRole}` : baseRole,
			weapon: parseWeapons(readInheritedJson(buildPath, character.path, 'weapons.json')),
			artifact: parseArtifacts(
				readInheritedJson(buildPath, character.path, 'artifacts-sets.json'),
			),
			mainStat: parseMainStats(
				readInheritedJson(buildPath, character.path, 'artifacts-mainstats.json'),
			),
			subStat: parseSubStats(
				readInheritedJson(buildPath, character.path, 'artifacts-substats.json'),
			),
		});
	}
	return { key, builds: builds.length ? builds : null };
}

function findCharacter(slug: string): { slug: string; path: string } | undefined {
	const travelerElement = getTravelerElement(slug);
	for (const element of readdirSync(CONTENT, { withFileTypes: true })) {
		if (
			!element.isDirectory() ||
			(travelerElement && element.name !== travelerElement.toLowerCase())
		)
			continue;
		for (const rarity of readdirSync(join(CONTENT, element.name), { withFileTypes: true })) {
			if (!rarity.isDirectory()) continue;
			const path = join(CONTENT, element.name, rarity.name, travelerElement ? 'traveler' : slug);
			if (existsSync(join(path, 'metadata.json')))
				return { slug: travelerElement ? 'traveler' : slug, path };
		}
	}
}

function readInheritedJson<T>(
	buildPath: string,
	characterPath: string,
	file: string,
): T | undefined {
	return (
		readOptionalJson<T>(join(buildPath, file)) ?? readOptionalJson<T>(join(characterPath, file))
	);
}

function parseWeapons(data: { weapons?: { items: Item[] }[] } | undefined): WeaponGroup[] {
	return (data?.weapons ?? [])
		.map(({ items }) => items.map((item) => toKey(item, 'weapon')))
		.map((items) => (items.length === 1 ? items[0] : items));
}

function parseArtifacts(
	data: { artifact_sets?: { groups: Group[] }[]; conditional?: ConditionalEntry[] } | undefined,
): ArtifactGroup[] {
	const groups = (data?.artifact_sets ?? [])
		.map(({ groups }) => groups.filter((group) => !group.choose).flatMap(groupItems))
		.map((items) => items.filter((item) => typeof item !== 'object' || (item.pieces ?? 0) >= 4))
		.map((items) => items.map((item) => toKey(item, 'set')))
		.filter((items) => items.length)
		.map((items) => (items.length === 1 ? items[0] : items));
	const conditional = (data?.conditional ?? [])
		.flatMap((entry) =>
			'groups' in entry && entry.groups
				? entry.groups.flatMap(groupItems)
				: groupItems(entry as Group),
		)
		.filter((item) => typeof item !== 'object' || (item.pieces ?? 0) >= 4)
		.map((item) => toKey(item, 'set'));
	if (conditional.length) groups.push(conditional.length === 1 ? conditional[0] : conditional);
	return groups;
}

function parseMainStats(
	data: { main_stats?: Record<string, Item[]> } | undefined,
): ScrapedBuild['mainStat'] {
	return {
		sands: statGroup(data?.main_stats?.sands),
		goblet: statGroup(data?.main_stats?.goblet),
		circlet: statGroup(data?.main_stats?.circlet),
	};
}

function parseSubStats(
	data: { substats_priority?: (Item | { items: Item[] })[] } | undefined,
): ScrapedBuild['subStat'] {
	return (data?.substats_priority ?? []).map((entry) =>
		statGroup(typeof entry === 'object' && 'items' in entry ? entry.items : [entry]),
	);
}

function groupItems(group: Group): Item[] {
	return [...(group.items ?? []), ...(group.choices ?? []).flatMap(({ items }) => items)];
}

function statGroup(items: Item[] | undefined): string | string[] {
	const stats = mapStats(
		(items ?? []).map((item) =>
			itemName(item).replace(/\[\[stat:([^\]|]+)(?:\|[^\]]+)?]]/g, '$1'),
		),
	);
	return stats.length === 1 ? stats[0] : stats;
}

function itemName(item: Item): string {
	return typeof item === 'string' ? item : item.name;
}

function toKey(item: Item, kind: 'weapon' | 'set'): string {
	const name = ALIASES[kind]?.[itemName(item)] ?? itemName(item);
	const normalized = name
		.replaceAll('â€™', "'")
		.replaceAll('â€˜', "'")
		.replaceAll('â€“', '-')
		.replaceAll('â€”', '-');
	return pascalCase(normalized.replaceAll("'", ''));
}

function resolveTokens(value: string): string {
	return value.replace(
		/\[\[([^:]+):([^\]|]+)(?:\|[^\]]+)?]]/g,
		(_, type, id) => TRANSLATIONS[type]?.[id.toLowerCase()] ?? id,
	);
}

function readOptionalJson<T>(path: string): T | undefined {
	return existsSync(path) ? readJson<T>(path) : undefined;
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T;
}
