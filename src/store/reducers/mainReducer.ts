import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type State = {
	theme: string;
};

const initialState: State = {
	theme: 'default',
};

const mainSlice = createSlice({
	name: 'main',
	initialState,
	reducers: {
		setTheme(state, { payload }: PayloadAction<string>) {
			state.theme = payload;
		},
	},
});

export default mainSlice.reducer;
export const { actions: mainActions } = mainSlice;
