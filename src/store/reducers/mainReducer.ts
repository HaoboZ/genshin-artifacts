import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type State = { value: string };

const initialState: State = { value: '' };

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setValue(state, { payload }: PayloadAction<string>) {
			state.value = payload;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
