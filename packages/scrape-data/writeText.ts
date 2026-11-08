import { writeFileSync } from 'node:fs';
import { EOL } from 'node:os';

export function writeText(filepath: string, contents: string) {
	writeFileSync(filepath, contents.replace(/\r\n|\r|\n/g, EOL));
}
