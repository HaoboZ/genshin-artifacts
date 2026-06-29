import { pascalCase } from 'change-case';

export function nameToKey(name: string): string {
	// Site uses Unicode apostrophes and dashes that pascalCase does not handle — normalize first.
	const normalized = name
		.replaceAll('’', "'")
		.replaceAll('‘', "'")
		.replaceAll('–', '-')
		.replaceAll('—', '-');
	return pascalCase(normalized.replaceAll("'", ''));
}
