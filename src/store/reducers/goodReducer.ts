import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { CharacterKey, IArtifact, IGOOD, IWeapon } from '../../types/good';

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
		editArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			state.artifacts = [...state.artifacts];
			if (index !== -1) state.artifacts[index] = payload;
		},
		deleteArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.artifacts = state.artifacts.filter((_, i) => i !== index);
		},
		addWeapon(state, { payload }: PayloadAction<IWeapon>) {
			state.weapons = [...state.weapons, payload];
		},
		editWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			state.weapons = [...state.weapons];
			if (index !== -1) state.weapons[index] = payload;
		},
		deleteWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.weapons = state.weapons.filter((_, i) => i !== index);
		},
	},
});

export default goodSlice.reducer;
export const { actions: goodActions } = goodSlice;
