const KEY = 'genshinArtifactsPersist';

export function loadState() {
	try {
		const serializedState = localStorage.getItem(KEY);
		if (!serializedState) return undefined;
		const state = JSON.parse(serializedState);
		if (!('weekly' in state.main)) state.main.weekly = {};
		return state;
	} catch (e) {
		return undefined;
	}
}

export async function saveState(state: any) {
	localStorage.setItem(KEY, JSON.stringify(state));
}
