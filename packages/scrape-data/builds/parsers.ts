import { requiredText } from '../data/helpers';
import type { ArtifactGroup, ScrapedBuild, WeaponGroup } from './types';
import { nameToKey } from './utils';
import { mapStats } from './mapStats';

export function parseWeapons(card: Element): WeaponGroup[] {
	const groups: WeaponGroup[] = [];
	for (const groupEl of card.querySelectorAll('.weapon-card .rank-list .rank-group')) {
		const rows = [...groupEl.querySelectorAll(':scope > .rank-row')];
		const primary = rows.find((r) => !r.classList.contains('alt'));
		if (!primary) continue;
		const names = [primary, ...rows.filter((r) => r.classList.contains('alt'))]
			.map(readItemName)
			.filter(Boolean)
			.map(nameToKey);
		if (names.length === 0) continue;
		groups.push(names.length === 1 ? names[0] : names);
	}
	return groups;
}

export function parseArtifactSets(card: Element): ArtifactGroup[] {
	const setsCard = card.querySelector('.artifact-sets-card');
	if (!setsCard) return [];

	const ranks = [...setsCard.querySelectorAll(':scope .rank-list')];

	// The first rank-list inside `.recommendation-section` is the unconditional priority list.
	const unconditionalLists = ranks.filter((l) => !l.closest('.conditional-list'));
	// `.conditional-list` (when present) is the second rank-list
	const conditionalLists = ranks.filter((l) => l.closest('.conditional-list'));

	const groups: ArtifactGroup[] = [];

	for (const list of unconditionalLists) {
		for (const groupEl of list.querySelectorAll(':scope > .rank-group')) {
			// One rank-group is one priority slot
			const names: string[] = [];
			for (const row of groupEl.querySelectorAll(':scope > .rank-row')) {
				if (isChooseTwoRow(row)) continue;
				names.push(...readSetNames(row));
			}
			if (names.length === 0) continue;
			groups.push(names.length === 1 ? names[0] : names);
		}
	}

	if (conditionalLists.length) {
		const condNames: string[] = [];
		for (const list of conditionalLists) {
			for (const row of list.querySelectorAll('.rank-row')) {
				if (isChooseTwoRow(row)) continue;
				condNames.push(...readSetNames(row));
			}
		}
		if (condNames.length) {
			// All conditional sets form a single group appended at the end
			groups.push(condNames.length === 1 ? condNames[0] : condNames);
		}
	}

	return groups;
}

export function parseMainStats(card: Element): ScrapedBuild['mainStat'] {
	const statsCard = card.querySelector('.artifact-stats-card');
	const out: ScrapedBuild['mainStat'] = {
		sands: '',
		goblet: '',
		circlet: '',
	};
	if (!statsCard) return out;

	for (const row of statsCard.querySelectorAll('.stat-row')) {
		const slot = requiredText(row.querySelector('strong'), 'artifact stat slot').toLowerCase() as
			'sands' | 'goblet' | 'circlet';
		const labels = [...row.querySelectorAll('.inline-note-label')].map((el) => {
			// Strip the note-link "ⓘ" marker before reading
			const clone = el.cloneNode(true) as HTMLElement;
			for (const note of clone.querySelectorAll('.note-link')) note.remove();
			return decodeHtmlEntities(clone.textContent ?? '').trim();
		});
		const keys = mapStats(labels);
		out[slot] = keys.length === 1 ? keys[0] : keys;
	}
	return out;
}

export function parseSubStats(card: Element): (string | string[])[] {
	const statsCard = card.querySelector('.artifact-stats-card');
	if (!statsCard) return [];
	const subSection = [...statsCard.querySelectorAll('.section')].find((s) =>
		s.querySelector('h3')?.textContent?.trim().startsWith('Substats'),
	);
	if (!subSection) return [];

	// Each `.rank-group` is one priority tier
	const out: (string | string[])[] = [];
	for (const groupEl of subSection.querySelectorAll(':scope > .rank-list > .rank-group')) {
		const stats: string[] = [];
		for (const row of groupEl.querySelectorAll(':scope > .rank-row')) {
			const label = row.querySelector('.inline-note-label');
			if (!label) continue;
			const clone = label.cloneNode(true) as HTMLElement;
			for (const note of clone.querySelectorAll('.note-link')) note.remove();
			const text = decodeHtmlEntities(clone.textContent ?? '').trim();
			if (!text) continue;
			stats.push(...mapStats([text]));
		}
		if (stats.length === 0) continue;
		out.push(stats.length === 1 ? stats[0] : stats);
	}
	return out;
}

function readSetNames(row: Element): string[] {
	const names: string[] = [];
	for (const trigger of row.querySelectorAll('.info-popover-trigger')) {
		if (trigger.querySelector('.artifact-piece-suffix')?.textContent?.includes('(2)')) continue;
		const clone = trigger.cloneNode(true) as HTMLElement;
		for (const note of clone.querySelectorAll('.note-link, .artifact-piece-suffix'))
			note.remove();
		const name = decodeHtmlEntities(clone.textContent ?? '').trim();
		if (name) names.push(nameToKey(name));
	}
	return names;
}

function isChooseTwoRow(row: Element): boolean {
	return row.querySelector('.accent-text')?.textContent?.trim() === '[Choose Two]';
}

function readItemName(row: Element): string {
	const trigger = row.querySelector('.info-popover-trigger');
	if (!trigger) {
		// Fallback for sub-stat rows that don't have an info-popover wrapper
		const label = row.querySelector('.inline-note-label');
		if (label) return decodeHtmlEntities((label as HTMLElement).textContent ?? '').trim();
		return '';
	}
	// Clone so we can mutate without affecting the document
	const clone = trigger.cloneNode(true) as HTMLElement;
	for (const note of clone.querySelectorAll('.note-link, .artifact-piece-suffix')) note.remove();
	return decodeHtmlEntities(clone.textContent ?? '').trim();
}

function decodeHtmlEntities(text: string) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(+code))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.trim();
}
