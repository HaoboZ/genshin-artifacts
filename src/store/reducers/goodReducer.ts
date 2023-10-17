import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { CharacterKey, IArtifact, ICharacter, IGOOD, IWeapon } from '../../good';

const initialState: IGOOD = {
	format: 'GOOD',
	version: 2,
	source: 'genshin-artifacts.vercel.app',
	characters: [],
	artifacts: [],
	weapons: [],
};

const goodSlice = createSlice({
	name: 'good',
	initialState,
	reducers: {
		reset() {
			return initialState;
		},
		import(state, { payload }: PayloadAction<IGOOD>) {
			return payload;
		},
		addCharacter(state, { payload }: PayloadAction<ICharacter>) {
			state.characters = [...state.characters, payload];
		},
		editCharacter(state, { payload }: PayloadAction<[CharacterKey, ICharacter]>) {
			const index = findIndex(state.characters, { key: payload[0] });
			state.characters = [...state.characters];
			state.characters[index] = payload[1];
		},
		deleteCharacter(state, { payload }: PayloadAction<CharacterKey>) {
			state.characters = state.characters.filter(({ key }) => key !== payload);
		},
		addArtifact(state, { payload }: PayloadAction<IArtifact>) {
			state.artifacts = [...state.artifacts, payload];
		},
		editArtifact(state, { payload }: PayloadAction<[number, IArtifact]>) {
			state.artifacts[payload[0]] = payload[1];
		},
		deleteArtifact(state, { payload }: PayloadAction<number>) {
			state.artifacts = state.artifacts.filter((_, index) => index !== payload);
		},
		addWeapon(state, { payload }: PayloadAction<IWeapon>) {
			state.weapons = [...state.weapons, payload];
		},
		editWeapon(state, { payload }: PayloadAction<[number, IWeapon]>) {
			state.weapons[payload[0]] = payload[1];
		},
		deleteWeapon(state, { payload }: PayloadAction<number>) {
			state.weapons = state.weapons.filter((_, index) => index !== payload);
		},
	},
});

export default goodSlice.reducer;
export const { actions: goodActions } = goodSlice;
