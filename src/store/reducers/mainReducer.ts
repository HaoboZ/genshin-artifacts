import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CharacterKey } from '../../types/good';

type State = { priority: Record<string, CharacterKey[]> };

const initialState: State = { priority: { 0: [], 1: [], 2: [], 3: [], 4: [] } };

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setPriority(state, { payload }: PayloadAction<Record<string, CharacterKey[]>>) {
			state.priority = payload;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
