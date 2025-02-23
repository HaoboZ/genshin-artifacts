import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import hash from 'object-hash';
import { differenceWith, uniqueBy } from 'remeda';
import type { Build } from '../../types/data';
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
			if (payload.weapons) {
				payload.weapons = payload.weapons.filter(({ level }) => level > 1);
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
						talent: { auto: 1, skill: 1, burst: 1 },
					},
				];
			} else {
				state.characters = state.characters.filter(({ key }) => key !== payload);
			}
		},
		editSkills(
			state,
			{
				payload,
			}: PayloadAction<{
				character: CharacterKey;
				talent: { auto?: number; skill?: number; burst?: number };
			}>,
		) {
			state.characters = state.characters.map((character) =>
				character.key === payload.character
					? { ...character, talent: { ...character.talent, ...payload.talent } }
					: character,
			);
		},
		addArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const oldArtifact = state.artifacts.find(
				({ location, slotKey }) => location === payload.location && slotKey === payload.slotKey,
			);
			if (oldArtifact) oldArtifact.location = '';
			state.artifacts = [...state.artifacts, payload];
		},
		addArtifacts(state, { payload }: PayloadAction<IArtifact[]>) {
			state.artifacts = uniqueBy([...state.artifacts, ...payload], (artifact) =>
				hash(artifact, { excludeKeys: (key) => key === 'location' }),
			);
			state.artifacts.forEach((artifact) => {
				const oldArtifact = state.artifacts.find(
					({ location, slotKey }) =>
						location === artifact.location && slotKey === artifact.slotKey,
				);
				if (oldArtifact.id !== artifact.id) oldArtifact.location = '';
			});
		},
		editArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			state.artifacts = [...state.artifacts];
			if (index !== -1) {
				const oldArtifact = state.artifacts.find(
					({ location, slotKey }) =>
						location === payload.location && slotKey === payload.slotKey,
				);
				if (oldArtifact) oldArtifact.location = '';
				state.artifacts[index] = payload;
			}
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
		},
		optimizeArtifacts(
			state,
			{ payload }: PayloadAction<{ artifact: IArtifact; character: Build }[]>,
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
		},
		deleteArtifact(state, { payload }: PayloadAction<IArtifact>) {
			const index = state.artifacts.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.artifacts = state.artifacts.filter((_, i) => i !== index);
		},
		deleteArtifacts(state, { payload }: PayloadAction<IArtifact[]>) {
			state.artifacts = differenceWith(state.artifacts, payload, (a, b) => a.id === b.id);
		},
		deleteUnlockedArtifacts(state) {
			state.artifacts = state.artifacts.filter(({ lock, location }) => lock || location);
		},
		addWeapon(state, { payload }: PayloadAction<IWeapon>) {
			state.weapons = [...state.weapons, payload];
		},
		editWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			state.weapons = [...state.weapons];
			if (index !== -1) state.weapons[index] = payload;
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
		},
		optimizeWeapons(state, { payload }: PayloadAction<{ weapon: IWeapon; character: Build }[]>) {
			state.weapons = [...state.weapons];
			for (const { weapon, character } of payload) {
				let weaponAIndex = state.weapons.findIndex(({ id }) => id === weapon.id);
				const weaponA = state.weapons[weaponAIndex];
				const characterB = weaponA.location;
				if (weaponAIndex === -1) weaponAIndex = state.weapons.length;
				const weaponBIndex = state.weapons.findIndex(
					({ location }) => location === character.key,
				);

				if (weaponBIndex) {
					state.weapons[weaponBIndex] = {
						...state.weapons[weaponBIndex],
						location: characterB || '',
					};
				}
				state.weapons[weaponAIndex] = { ...weaponA, location: character.key };
			}
		},
		deleteWeapon(state, { payload }: PayloadAction<IWeapon>) {
			const index = state.weapons.findIndex(({ id }) => id === payload.id);
			if (index !== -1) state.weapons = state.weapons.filter((_, i) => i !== index);
		},
	},
});

export default goodSlice.reducer;
export const { actions: goodActions } = goodSlice;
