import { pascalCase } from 'change-case';

export function getTravelerElement(slug: string): string | null {
	const match = slug.match(/^(anemo|cryo|dendro|electro|geo|hydro|pyro)-traveler$/);
	return match ? pascalCase(match[1]) : null;
}
