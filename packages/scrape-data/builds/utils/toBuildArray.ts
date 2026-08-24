import type { ScrapedBuild } from '../types';

export function toBuildArray(value: ScrapedBuild | ScrapedBuild[] | undefined): ScrapedBuild[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}
