import { pascalCase } from 'change-case';
import { mapKeys } from 'remeda';

const KEY = 'genshinArtifactsPersist';

export function loadState() {
	try {
		const serializedState = localStorage.getItem(KEY);
		if (!serializedState) return undefined;
		const state = JSON.parse(serializedState);
		if (state.main?.weekly) {
			const weekly = state.main.weekly;
			delete state.main.weekly;
			state.good.materials = mapKeys(weekly, (key) => pascalCase(key.replace(/'/g, '')));
		}
		return state;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

export async function saveState(state: any) {
	localStorage.setItem(KEY, JSON.stringify(state));
}
