import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CharacterKey } from '../../types/good';

type State = { priority: CharacterKey[][] };

const initialState: State = { priority: [[], [], [], [], []] };

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setPriority(state, { payload }: PayloadAction<CharacterKey[][]>) {
			state.priority = payload;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
