const STAT_MAP: Record<string, string> = {
	'hp': 'hp',
	'hp%': 'hp_',
	'atk': 'atk',
	'atk%': 'atk_',
	'def': 'def',
	'def%': 'def_',
	'em': 'eleMas',
	'er': 'enerRech_',
	'healing-bonus': 'heal_',
	'cr': 'critRate_',
	'cd': 'critDMG_',
	'cr/cd': 'critRD_',
	'physical-dmg': 'physical_dmg_',
	'anemo-dmg': 'anemo_dmg_',
	'geo-dmg': 'geo_dmg_',
	'electro-dmg': 'electro_dmg_',
	'hydro-dmg': 'hydro_dmg_',
	'pyro-dmg': 'pyro_dmg_',
	'cryo-dmg': 'cryo_dmg_',
	'dendro-dmg': 'dendro_dmg_',
};

export function mapStat(id: string): string {
	const key = STAT_MAP[id];
	if (!key) throw new Error(`Unknown stat ID: ${JSON.stringify(id)}`);
	return key;
}
