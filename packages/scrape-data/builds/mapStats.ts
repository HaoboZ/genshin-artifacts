const STAT_MAP: Record<string, string> = {
	'HP': 'hp',
	'HP%': 'hp_',
	'Flat HP': 'hp',
	'ATK': 'atk',
	'ATK%': 'atk_',
	'Flat ATK': 'atk',
	'DEF': 'def',
	'DEF%': 'def_',
	'Flat DEF': 'def',
	'Elemental Mastery': 'eleMas',
	'Energy Recharge': 'enerRech_',
	'Healing Bonus': 'heal_',
	'CRIT Rate': 'critRate_',
	'CRIT DMG': 'critDMG_',
	'CRIT Rate / CRIT DMG': 'critRD_',
	'Physical DMG': 'physical_dmg_',
	'Anemo DMG': 'anemo_dmg_',
	'Geo DMG': 'geo_dmg_',
	'Electro DMG': 'electro_dmg_',
	'Hydro DMG': 'hydro_dmg_',
	'Pyro DMG': 'pyro_dmg_',
	'Cryo DMG': 'cryo_dmg_',
	'Dendro DMG': 'dendro_dmg_',
};

function mapStat(label: string): string {
	const key = STAT_MAP[label];
	if (!key) throw new Error(`Unknown stat label: ${JSON.stringify(label)}`);
	return key;
}

export function mapStats(labels: string[]): string[] {
	const flat = labels.flatMap((l) => l.split(/\s*\/\s*/));
	const out: string[] = [];
	for (let i = 0; i < flat.length; i++) {
		if (flat[i] === 'CRIT Rate' && flat[i + 1] === 'CRIT DMG') {
			out.push('critRD_');
			i++;
		} else {
			out.push(mapStat(flat[i]));
		}
	}
	return out;
}
