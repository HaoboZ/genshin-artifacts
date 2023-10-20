import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { CharacterKey, IArtifact, IGOOD, IWeapon } from '../../good';

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
		giveArtifact(state, { payload }: PayloadAction<[CharacterKey, IArtifact]>) {
			const characterA = payload[0];
			const artifactA = payload[1];
			const characterB = artifactA.location;
			let artifactAIndex = state.artifacts.findIndex(({ id }) => id === artifactA.id);
			if (artifactAIndex === -1) {
				artifactA.id = nanoid();
				artifactAIndex = state.artifacts.length;
			}
			const artifactBIndex = state.artifacts.findIndex(
				({ location, slotKey }) => location === characterA && slotKey === artifactA.slotKey,
			);

			state.artifacts = [...state.artifacts];
			if (artifactBIndex)
				state.artifacts[artifactBIndex] = {
					...state.artifacts[artifactBIndex],
					location: characterB || '',
				};
			state.artifacts[artifactAIndex] = { ...artifactA, location: characterA };
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
