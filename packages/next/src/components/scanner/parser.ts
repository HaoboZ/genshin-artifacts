import { artifactSetsInfo } from '@/api/artifacts';
import type { IArtifact, ISubstat, SlotKey, StatKey } from '@/types/good';

const statLabels: Array<[RegExp, StatKey]> = [
	[/\b(?:hp|health)(?:\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?)?\s*%/i, 'hp_'],
	[/\b(?:hp|health)\b(?!\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?\s*%)/i, 'hp'],
	[/\b(?:atk|attack)(?:\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?)?\s*%/i, 'atk_'],
	[/\b(?:atk|attack)\b(?!\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?\s*%)/i, 'atk'],
	[/\b(?:def|defense|defence)(?:\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?)?\s*%/i, 'def_'],
	[/\b(?:def|defense|defence)\b(?!\s*[+\uFF0B]?\s*\d+(?:[.,]\d+)?\s*%)/i, 'def'],
	[/\b(?:elemental\s+mastery|elem(?:ental)?\s+mas(?:tery)?)\b/i, 'eleMas'],
	[/\b(?:energy\s+recharge|ener(?:gy)?\s+rech(?:arge)?)\b/i, 'enerRech_'],
	[/\b(?:healing\s+bonus|heal)\b/i, 'heal_'],
	[/\b(?:crit(?:ical)?\s+rate|cr\s*rate)\b/i, 'critRate_'],
	[/\b(?:crit(?:ical)?\s+(?:dmg|damage)|cr\s*dmg)\b/i, 'critDMG_'],
	[/\bphysical\s+(?:dmg|damage)\b/i, 'physical_dmg_'],
	[/\banemo\s+(?:dmg|damage)\b/i, 'anemo_dmg_'],
	[/\bgeo\s+(?:dmg|damage)\b/i, 'geo_dmg_'],
	[/\belectro\s+(?:dmg|damage)\b/i, 'electro_dmg_'],
	[/\bhydro\s+(?:dmg|damage)\b/i, 'hydro_dmg_'],
	[/\bpyro\s+(?:dmg|damage)\b/i, 'pyro_dmg_'],
	[/\bcryo\s+(?:dmg|damage)\b/i, 'cryo_dmg_'],
	[/\bdendro\s+(?:dmg|damage)\b/i, 'dendro_dmg_'],
];

const slots: Array<[RegExp, SlotKey]> = [
	[/\bflower(?:\s+of\s+life)?\b/i, 'flower'],
	[/\bplume(?:\s+of\s+death)?\b/i, 'plume'],
	[/\bsands?(?:\s+of\s+eon)?\b/i, 'sands'],
	[/\bgoblet(?:\s+of\s+eonothem)?\b/i, 'goblet'],
	[/\bcirclet(?:\s+of\s+logos)?\b/i, 'circlet'],
];

export const setNames: Array<[string, IArtifact['setKey']]> = Object.values(artifactSetsInfo)
	.map(({ name, key }): [string, IArtifact['setKey']] => [name, key])
	.sort((a, b) => b[0].length - a[0].length);

export function normalized(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchSet(text: string): IArtifact['setKey'] | undefined {
	const haystack = normalized(text);
	return setNames.find(([name]) => haystack.includes(normalized(name)))?.[1];
}

function matchSlot(text: string): SlotKey | undefined {
	return slots.find(([pattern]) => pattern.test(text))?.[1];
}

function getNumber(text: string): number | undefined {
	const match = text.match(/[+\uFF0B]?\s*(\d+(?:[.,]\d+)?)/);
	return match ? Number(match[1].replace(',', '.')) : undefined;
}

export function parseSubstats(
	lines: string[],
	mainStatKey: StatKey,
	includeUnactivated = false,
): ISubstat[] {
	const result: ISubstat[] = [];
	const levelIndex = lines.findIndex((line) => /^\s*[+\uFF0B]\s*\d{1,2}\s*$/.test(line));
	let previousStat = -1;
	for (let index = Math.max(0, levelIndex + 1); index < lines.length; index += 1) {
		const line = lines[index];
		if (/set\s*:|2-piece|4-piece/i.test(line)) break;
		if (/^\(?unactivated\)?$/i.test(line.trim()) && previousStat >= 0) {
			result[previousStat] = { ...result[previousStat], unactivated: true };
			continue;
		}
		const match = statLabels.find(([pattern]) => pattern.test(line));
		if (!match || match[1] === mainStatKey) continue;
		// OCR can split a percentage main stat into a label line and a value line,
		// then misread the label as a flat substat (for example `ATK` + `46.6%`).
		// A real flat substat has an explicit plus sign, so keep those later lines.
		if (
			mainStatKey.endsWith('_') &&
			match[1] === mainStatKey.slice(0, -1) &&
			!/[+\uFF0B]/.test(line)
		)
			continue;
		const value = getNumber(line) ?? getNumber(lines[index + 1] ?? '');
		if (value === undefined || result.some((stat) => stat.key === match[1])) continue;
		result.push({
			key: match[1],
			value,
			...(/unactivated/i.test(line) ? { unactivated: true } : {}),
		});
		previousStat = result.length - 1;
	}
	return result
		.filter((stat) => Boolean(stat.unactivated) === includeUnactivated)
		.slice(0, includeUnactivated ? 1 : 4);
}

type ArtifactFlags = Pick<IArtifact, 'lock' | 'astralMark'>;

export function parseArtifactText(
	text: string,
	flags: ArtifactFlags = { lock: false, astralMark: false },
): Partial<IArtifact> {
	const lines = text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const allText = lines.join(' ');
	const setKey = matchSet(allText);
	const slotKey = matchSlot(allText);
	const slotLine = lines.findIndex((line) => matchSlot(line));
	let mainStat =
		slotKey === 'flower'
			? 'hp'
			: slotKey === 'plume'
				? 'atk'
				: (lines
						.slice(Math.max(0, slotLine + 1), slotLine + 14)
						.map((line, index, statLines) => {
							const match = statLabels.find(([pattern]) => pattern.test(line));
							if (!match) return undefined;
							const key = match[1];
							return ['hp', 'atk', 'def'].includes(key) &&
								statLines
									.slice(index + 1, index + 10)
									.some((valueLine) => /\d+(?:[.,]\d+)?\s*(?:%|[)>])/.test(valueLine))
								? (`${key}_` as StatKey)
								: key;
						})
						.find((key): key is StatKey => Boolean(key)) ??
					statLabels.find(([pattern]) => pattern.test(allText))?.[1]);
	if (
		mainStat &&
		!['flower', 'plume'].includes(slotKey ?? '') &&
		['hp', 'atk', 'def'].includes(mainStat)
	) {
		const statLine = lines.findIndex((line) =>
			statLabels.some(([pattern, key]) => key === mainStat && pattern.test(line)),
		);
		if (statLine >= 0 && /%/.test(lines[statLine + 1] ?? ''))
			mainStat = `${mainStat}_` as StatKey;
	}
	const level = Number(
		lines.find((line) => /^\s*[+\uFF0B]\s*\d{1,2}\s*$/.test(line))?.match(/\d+/)?.[0] ?? 0,
	);
	const stars = allText.match(/[\u2605\u2606]/g)?.length;
	if (!setKey || !slotKey || !mainStat) {
		const missing = [
			!setKey && 'setKey',
			!slotKey && 'slotKey',
			!mainStat && 'mainStatKey',
		].filter(Boolean);
		const setHeadingMatches = setNames
			.filter(([name]) => normalized(allText).includes(normalized(name)))
			.map(([name, key]) => ({ name, key }));
		const statMatches = lines.flatMap((line) => {
			const match = statLabels.find(([pattern]) => pattern.test(line));
			return match ? [{ line, key: match[1] }] : [];
		});
		throw new Error(
			[
				'Artifact OCR could not resolve all required fields.',
				`Missing: ${missing.join(', ') || 'none'}`,
				`Resolved: ${JSON.stringify({ setKey, slotKey, mainStatKey: mainStat })}`,
				`Set heading matches: ${JSON.stringify(setHeadingMatches)}`,
				`Stat line matches: ${JSON.stringify(statMatches)}`,
				`OCR text: ${allText}`,
			].join('\n'),
		);
	}
	return {
		setKey,
		slotKey,
		mainStatKey: mainStat,
		rarity: stars ? Math.min(stars, 5) : artifactSetsInfo[setKey].rarity,
		level,
		substats: parseSubstats(lines, mainStat),
		lock: flags.lock,
		astralMark: flags.astralMark,
		unactivatedSubstats: parseSubstats(lines, mainStat, true).map(({ key, value }) => ({
			key,
			value,
		})),
	};
}
