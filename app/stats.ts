import type { StatKey } from '@/src/good';
import { findIndex, includes } from 'lodash';

export const stats: Record<StatKey, Record<number, number>> = {
	hp: { 3: 287, 4: 956, 5: 1793 },
	hp_: { 3: 7, 4: 18.6, 5: 35 },
	atk: { 3: 19, 4: 62, 5: 117 },
	atk_: { 3: 7, 4: 18.6, 5: 35 },
	def: { 3: 22, 4: 74, 5: 139 },
	def_: { 3: 8.7, 4: 23.3, 5: 43.7 },
	eleMas: { 3: 28, 4: 75, 5: 140 },
	enerRech_: { 3: 7.8, 4: 20.7, 5: 38.9 },
	critRate_: { 3: 4.7, 4: 12.4, 5: 23.3 },
	critDMG_: { 3: 9.3, 4: 24.9, 5: 46.6 },
	anemo_dmg_: undefined,
	cryo_dmg_: undefined,
	dendro_dmg_: undefined,
	electro_dmg_: undefined,
	geo_dmg_: undefined,
	heal_: undefined,
	hydro_dmg_: undefined,
	physical_dmg_: undefined,
	pyro_dmg_: undefined,
};

export const rarityWeight = {
	3: 1.9,
	4: 1.45,
	5: 1.3,
};

export function getWeightedTier(subStatArr, subStat) {
	if (!subStat) return 0;
	const statTier = findIndex(subStatArr, (subStatTier) =>
		Array.isArray(subStatTier) ? includes(subStatTier, subStat) : subStatTier === subStat,
	);

	return statTier === -1 ? 0 : 1 - Math.min(4, statTier) * 0.2;
}
