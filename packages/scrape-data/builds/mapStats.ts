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

function mapStat(id: string): string {
	const key = STAT_MAP[id];
	if (!key) throw new Error(`Unknown stat ID: ${JSON.stringify(id)}`);
	return key;
}

export function mapStats(ids: string[]): string[] {
	const flat = ids.flatMap((id) => id.split(/\s*\/\s*/));
	const hasCR = flat.includes('cr');
	const hasCD = flat.includes('cd');
	const collapse = hasCR && hasCD;
	// Walk through the flat list, emitting a single critRD_ at the first cr/cd
	// position and dropping the other. Non-crit entries pass through.
	const out: string[] = [];
	let critEmitted = false;
	for (let i = 0; i < flat.length; i++) {
		const id = flat[i];
		if (collapse && (id === 'cr' || id === 'cd')) {
			if (!critEmitted) {
				out.push('critRD_');
				critEmitted = true;
			}
			// Skip: this is one of the crit pair, already handled (or duplicate).
			continue;
		}
		out.push(mapStat(id));
	}
	return out;
}
