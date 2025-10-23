import { fetchArtifacts, writeArtifacts } from './artifacts';
import { fetchCharacters, writeCharacters } from './characters';
import { fetchElements, writeElements } from './elements';
import { fetchTalents, writeTalents } from './talents';
import { fetchWeapons, writeWeapons } from './weapons';
import { fetchWeekly, writeWeekly } from './weekly';

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
		if (run.elements) console.log('Elements');
		const elements = run.elements && (await fetchElements());
		if (run.characters) console.log('Characters');
		const characters = run.characters && (await fetchCharacters());
		if (run.characters || run.talents) console.log('Talents');
		const talents = (run.characters || run.talents) && (await fetchTalents(characters));
		if (run.characters || run.weekly) console.log('Weekly');
		const weekly = (run.characters || run.weekly) && (await fetchWeekly(characters));
		if (run.artifacts) console.log('Artifacts');
		const artifacts = run.artifacts && (await fetchArtifacts());
		if (run.weapons) console.log('Weapons');
		const weapons = run.weapons && (await fetchWeapons());

		if (run.elements) writeElements(elements);
		if (run.characters) writeCharacters(characters);
		if (run.talents) writeTalents(talents);
		if (run.weekly) writeWeekly(weekly);
		if (run.artifacts) writeArtifacts(artifacts);
		if (run.weapons) writeWeapons(weapons);
		console.log('Completed');
	} catch (error) {
		console.log('An error has occurred ', error);
	}
})();
