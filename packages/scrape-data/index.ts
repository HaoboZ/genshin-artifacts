import { fetchArtifacts, writeArtifacts } from './data/artifacts';
import { fetchCharacters, writeCharacters } from './data/characters';
import { fetchElements, writeElements } from './data/elements';
import { fetchTalents, writeTalents } from './data/talents';
import { fetchWeapons, writeWeapons } from './data/weapons';
import { fetchWeekly, writeWeekly } from './data/weekly';

const config = {
	elements: false,
	characters: false,
	talents: false,
	weekly: false,
	artifacts: false,
	weapons: false,
};

try {
	if (config.elements) console.info('Elements');
	const elements = config.elements && (await fetchElements());
	if (config.characters) console.info('Characters');
	const characters = config.characters && (await fetchCharacters());
	if (config.characters || config.talents) console.info('Talents');
	const talents = (config.characters || config.talents) && (await fetchTalents(characters));
	if (config.characters || config.weekly) console.info('Weekly');
	const weekly = (config.characters || config.weekly) && (await fetchWeekly(characters));
	if (config.artifacts) console.info('Artifacts');
	const artifacts = config.artifacts && (await fetchArtifacts());
	if (config.weapons) console.info('Weapons');
	const weapons = config.weapons && (await fetchWeapons());

	if (elements) writeElements(elements);
	if (characters) writeCharacters(characters);
	if (talents) writeTalents(talents);
	if (weekly) writeWeekly(weekly);
	if (artifacts) writeArtifacts(artifacts);
	if (weapons) writeWeapons(weapons);
	console.info('Completed');
} catch (error) {
	console.error('An error has occurred ', error);
}
