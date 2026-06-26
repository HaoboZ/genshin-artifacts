import { fetchArtifacts, writeArtifacts } from './data/artifacts';
import { fetchAllBuilds, loadExistingBuilds, writeBuilds } from './builds/builds';
import { fetchCharacters, writeCharacters } from './data/characters';
import { fetchElements, writeElements } from './data/elements';
import { fetchTalents, writeTalents } from './data/talents';
import { fetchWeapons, writeWeapons } from './data/weapons';
import { fetchWeekly, writeWeekly } from './data/weekly';

const fields = ['elements', 'characters', 'talents', 'weekly', 'artifacts', 'weapons'] as const;
type Field = (typeof fields)[number];

function getConfig(args: string[]) {
	const selected = args.length ? args : ['all'];
	const unknown = selected.filter((field) => field !== 'all' && !fields.includes(field as Field));
	if (unknown.length) {
		throw new Error(
			`Unknown scrape field(s): ${unknown.join(', ')}\nUsage: bun run start -- [all|${fields.join('|')}]`,
		);
	}

	const enabled = new Set<Field>(
		selected.includes('all') ? fields : selected.map((field) => field as Field),
	);
	return Object.fromEntries(fields.map((field) => [field, enabled.has(field)])) as Record<
		Field,
		boolean
	>;
}

const subcommands = ['builds'] as const;
type Subcommand = (typeof subcommands)[number];

function getSubcommand(args: string[]): { subcommand?: Subcommand; rest: string[] } {
	const first = args[0];
	if (first && (subcommands as readonly string[]).includes(first)) {
		return { subcommand: first as Subcommand, rest: args.slice(1) };
	}
	return { rest: args };
}

try {
	const { subcommand, rest } = getSubcommand(process.argv.slice(2));

	if (subcommand === 'builds') {
		console.info('Builds');
		// Always read existing builds.json so the scraper can preserve hand-edited
		// `group` values on re-scrape ("edit, not override"). When specific characters
		// are requested, the new entries are merged into the file; otherwise the file
		// is replaced wholesale with the freshly-scraped entries.
		const existing = loadExistingBuilds();
		const builds = await fetchAllBuilds(rest, existing);
		await writeBuilds(builds, { mergeWithExisting: rest.length > 0 });
		console.info(`Wrote ${Object.keys(builds).length} builds to ../next/public/data/builds.json`);
		console.info('Completed');
	} else {
		const config = getConfig(subcommand);

		if (config.elements) console.info('Elements');
		const elements = config.elements && (await fetchElements());
		if (config.characters) console.info('Characters');
		const characters = config.characters && (await fetchCharacters());
		if (config.characters || config.talents) console.info('Talents');
		const talentData = (config.characters || config.talents) && (await fetchTalents());
		if (config.characters || config.weekly) console.info('Weekly');
		const weeklyData = (config.characters || config.weekly) && (await fetchWeekly());
		if (config.artifacts) console.info('Artifacts');
		const artifacts = config.artifacts && (await fetchArtifacts());
		if (config.weapons) console.info('Weapons');
		const weapons = config.weapons && (await fetchWeapons());

		if (characters && talentData) {
			for (const character of characters) {
				character.talentMaterial = talentData.characterTalentMaterials[character.name];
			}
		}
		if (characters && weeklyData) {
			for (const character of characters) {
				character.weeklyMaterial = weeklyData.characterWeeklyMaterials[character.name];
			}
		}

		if (elements) writeElements(elements);
		if (characters) writeCharacters(characters);
		if (talentData) writeTalents(talentData.talents);
		if (weeklyData) writeWeekly(weeklyData.weekly);
		if (artifacts) writeArtifacts(artifacts);
		if (weapons) writeWeapons(weapons);
		console.info('Completed');
	}
} catch (error) {
	console.error('An error has occurred ', error);
	process.exitCode = 1;
}
