import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CharacterKey } from '../../types/good';

type State = {
	priority: Record<string, CharacterKey[]>;
	weekly: Record<string, number>;
	artifactRespawn: number;
	materialRespawn: number;
	crystalRespawn: number;
};

const initialState: State = {
	priority: { 0: [], 1: [], 2: [], 3: [], 4: [] },
	weekly: {},
	artifactRespawn: null,
	materialRespawn: null,
	crystalRespawn: null,
};

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setMain(state, { payload }: PayloadAction<State>) {
			state.priority = payload.priority;
			state.weekly = payload.weekly;
		},
		setPriority(state, { payload }: PayloadAction<Record<string, CharacterKey[]>>) {
			state.priority = payload;
		},
		setWeeklyMaterial(state, { payload }: PayloadAction<{ name: string; amount: number }>) {
			state.weekly = { ...state.weekly };
			state.weekly[payload.name] = payload.amount;
		},
		setArtifactRespawn(state, { payload }: PayloadAction<number>) {
			state.artifactRespawn = payload;
		},
		setMaterialRespawn(state, { payload }: PayloadAction<number>) {
			state.materialRespawn = payload;
		},
		setCrystalRespawn(state, { payload }: PayloadAction<number>) {
			state.crystalRespawn = payload;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
