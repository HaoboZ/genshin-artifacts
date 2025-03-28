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
	weapons: true,
};

(async () => {
	try {
		console.log('Elements');
		const elements = run.elements && (await fetchElements());
		console.log('Characters');
		const characters = run.characters && (await fetchCharacters());
		console.log('Talents');
		const talents = run.talents && (await fetchTalents(characters));
		console.log('Weekly');
		const weekly = run.weekly && (await fetchWeekly(characters));
		console.log('Artifacts');
		const artifacts = run.artifacts && (await fetchArtifacts());
		console.log('Weapons');
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
