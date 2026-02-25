import { fetchArtifacts, writeArtifacts } from './data/artifacts';
import { fetchCharacters, writeCharacters } from './data/characters';
import { fetchElements, writeElements } from './data/elements';
import { fetchTalents, writeTalents } from './data/talents';
import { fetchWeapons, writeWeapons } from './data/weapons';
import { fetchWeekly, writeWeekly } from './data/weekly';

const run = {
	elements: false,
	characters: false,
	talents: false,
	weekly: false,
	artifacts: false,
	weapons: false,
};

(async () => {
	try {
		if (run.elements) console.info('Elements');
		const elements = run.elements && (await fetchElements());
		if (run.characters) console.info('Characters');
		const characters = run.characters && (await fetchCharacters());
		if (run.characters || run.talents) console.info('Talents');
		const talents = (run.characters || run.talents) && (await fetchTalents(characters));
		if (run.characters || run.weekly) console.info('Weekly');
		const weekly = (run.characters || run.weekly) && (await fetchWeekly(characters));
		if (run.artifacts) console.info('Artifacts');
		const artifacts = run.artifacts && (await fetchArtifacts());
		if (run.weapons) console.info('Weapons');
		const weapons = run.weapons && (await fetchWeapons());

		if (run.elements) writeElements(elements);
		if (run.characters) writeCharacters(characters);
		if (run.talents) writeTalents(talents);
		if (run.weekly) writeWeekly(weekly);
		if (run.artifacts) writeArtifacts(artifacts);
		if (run.weapons) writeWeapons(weapons);
		console.info('Completed');
	} catch (error) {
		console.error('An error has occurred ', error);
	}
})();
