import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { differenceWith } from 'remeda';
import pget from '../../helpers/pget';
import type { Tier } from '../../types/data';
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
			if (!payload.characters && payload.weapons) {
				payload.characters = payload.weapons
					.filter(({ location }) => location)
					.map(({ location }) => ({
						key: location as any,
						level: 90,
						constellation: 0,
						ascension: 6,
						talent: { auto: 9, skill: 9, burst: 9 },
					}));
			}
			return { ...state, ...payload };
		},
		toggleCharacter(state, { payload }: PayloadAction<CharacterKey>) {
			const index = state.characters.findIndex(({ key }) => key === payload);
			if (index === -1) {
				state.characters = [
					...state.characters,
					{
						key: payload,
						level: 90,
						constellation: 0,
						ascension: 6,
						talent: { auto: 9, skill: 9, burst: 9 },
					},
				];
			} else {
				state.characters = state.characters.filter(({ key }) => key !== payload);
			}
			return state;
		},
		addArtifact(state, { payload }: PayloadAction<IArtifact>) {
			state.artifacts = [...state.artifacts, payload];
			return state;
		},
		editArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			state.artifacts = [...state.artifacts];
			if (index !== -1) state.artifacts[index] = payload;
			return state;
		},
		giveArtifact(state, { payload }: PayloadAction<[CharacterKey, IArtifact]>) {
			const characterA = payload[0];
			const artifactA = payload[1];
			const characterB = artifactA.location;
			let artifactAIndex = state.artifacts.findIndex(({ id }) => id === artifactA.id);
			if (artifactAIndex === -1) artifactAIndex = state.artifacts.length;
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
			return state;
		},
		optimizeArtifacts(
			state,
			{ payload }: PayloadAction<{ artifact: IArtifact; character: Tier }[]>,
		) {
			state.artifacts = [...state.artifacts];
			for (const { artifact, character } of payload) {
				let artifactAIndex = state.artifacts.findIndex(({ id }) => id === artifact.id);
				const artifactA = state.artifacts[artifactAIndex];
				const characterB = artifactA.location;
				if (artifactAIndex === -1) artifactAIndex = state.artifacts.length;
				const artifactBIndex = state.artifacts.findIndex(
					({ location, slotKey }) =>
						location === character.key && slotKey === artifactA.slotKey,
				);

				if (artifactBIndex)
					state.artifacts[artifactBIndex] = {
						...state.artifacts[artifactBIndex],
						location: characterB || '',
					};
				state.artifacts[artifactAIndex] = { ...artifactA, location: character.key };
			}
			return state;
		},
		removeArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			state.artifacts = [...state.artifacts];
			if (index !== -1) state.artifacts[index] = { ...payload, location: '' };
			return state;
		},
		deleteArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.artifacts = state.artifacts.filter((_, i) => i !== index);
			return state;
		},
		deleteArtifacts(state, { payload }: PayloadAction<IArtifact[]>) {
			state.artifacts = differenceWith(state.artifacts, payload, (a, b) => a.id === b.id);
			return state;
		},
		deleteUnlockedArtifacts(state) {
			state.artifacts = state.artifacts.filter(pget('lock'));
			return state;
		},
		addWeapon(state, { payload }: PayloadAction<IWeapon>) {
			state.weapons = [...state.weapons, payload];
			return state;
		},
		giveWeapon(state, { payload }: PayloadAction<[CharacterKey, IWeapon]>) {
			const characterA = payload[0];
			const weaponA = payload[1];
			const characterB = weaponA.location;
			let weaponAIndex = state.weapons.findIndex(({ id }) => id === weaponA.id);
			if (weaponAIndex === -1) weaponAIndex = state.weapons.length;
			const weaponBIndex = state.weapons.findIndex(({ location }) => location === characterA);

			state.weapons = [...state.weapons];
			if (weaponBIndex)
				state.weapons[weaponBIndex] = {
					...state.weapons[weaponBIndex],
					location: characterB || '',
				};
			state.weapons[weaponAIndex] = { ...weaponA, location: characterA };
			return state;
		},
		optimizeWeapons(state, { payload }: PayloadAction<{ weapon: IWeapon; character: Tier }[]>) {
			state.weapons = [...state.weapons];
			for (const { weapon, character } of payload) {
				let weaponAIndex = state.weapons.findIndex(({ id }) => id === weapon.id);
				const weaponA = state.weapons[weaponAIndex];
				const characterB = weaponA.location;
				if (weaponAIndex === -1) weaponAIndex = state.weapons.length;
				const weaponBIndex = state.weapons.findIndex(
					({ location }) => location === character.key,
				);

				if (weaponBIndex)
					state.weapons[weaponBIndex] = {
						...state.weapons[weaponBIndex],
						location: characterB || '',
					};
				state.weapons[weaponAIndex] = { ...weaponA, location: character.key };
			}
			return state;
		},
		removeWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			state.weapons = [...state.weapons];
			if (index !== -1) state.weapons[index] = { ...payload, location: '' };
			return state;
		},
		deleteWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.weapons = state.weapons.filter((_, i) => i !== index);
			return state;
		},
	},
});

export default goodSlice.reducer;
export const { actions: goodActions } = goodSlice;
