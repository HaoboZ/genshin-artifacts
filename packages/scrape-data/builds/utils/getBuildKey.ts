import { pascalCase } from 'change-case';
import { getTravelerElement } from './getTravelerElement';

const BUILD_KEY_ALIASES: Record<string, string> = { 'shogun-raiden': 'RaidenShogun' };

export function getBuildKey(slug: string): string {
	return getTravelerElement(slug) ? 'Traveler' : (BUILD_KEY_ALIASES[slug] ?? pascalCase(slug));
}
