const KEY = 'genshinArtifactsPersist';

export function loadState() {
	try {
		const serializedState = localStorage.getItem(KEY);
		if (!serializedState) return undefined;
		return JSON.parse(serializedState);
	} catch (e) {
		return undefined;
	}
}

export async function saveState(state: any) {
	localStorage.setItem(KEY, JSON.stringify(state));
}
