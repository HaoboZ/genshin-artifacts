import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CharacterKey } from '../../types/good';

type State = {
	priority: Record<string, CharacterKey[]>;
	weekly: Record<string, number>;
};

const initialState: State = { priority: { 0: [], 1: [], 2: [], 3: [], 4: [] }, weekly: {} };

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setPriority(state, { payload }: PayloadAction<Record<string, CharacterKey[]>>) {
			state.priority = payload;
		},
		setWeeklyMaterial(state, { payload }: PayloadAction<{ name: string; amount: number }>) {
			state.weekly = { ...state.weekly };
			state.weekly[payload.name] = payload.amount;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
