import { normalized, setNames } from './parser';
import type { ArtifactPanelAnchor, OcrBlocks, OcrLine, OcrWord } from './types';

const slotHeadings: Array<[RegExp, string]> = [
	[/\bflower\s+of\s+life\b/i, 'flower'],
	[/\bplume\s+of\s+death\b/i, 'plume'],
	[/\bsands?\s+of\s+eon\b/i, 'sands'],
	[/\bgoblet\s+of\s+eonothem\b/i, 'goblet'],
	[/\bcirclet\s+of\s+logos\b/i, 'circlet'],
];

export function getOcrLines(data: OcrBlocks): OcrLine[] {
	return (
		data.blocks?.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines)) ??
		[]
	);
}

function phraseAnchor(line: OcrLine, phrase: string): OcrWord | undefined {
	const firstWord = normalized(phrase).match(/^[a-z]+/)?.[0];
	return line.words.find((word) => normalized(word.text).includes(firstWord ?? ''));
}

export function findArtifactPanelAnchor(data: OcrBlocks): ArtifactPanelAnchor | undefined {
	const lines = getOcrLines(data);
	const slotAnchors = lines.flatMap((line) => {
		const match = slotHeadings.find(([pattern]) => pattern.test(line.text));
		const word = match && phraseAnchor(line, match[1]);
		return match && word ? [{ line, word }] : [];
	});
	if (slotAnchors.length) return slotAnchors.sort((a, b) => b.word.bbox.x0 - a.word.bbox.x0)[0];

	const setAnchors = lines.flatMap((line) =>
		setNames.flatMap(([name]) => {
			if (!normalized(line.text).includes(normalized(name))) return [];
			const word = phraseAnchor(line, name);
			return word ? [{ line, word }] : [];
		}),
	);
	return setAnchors.sort((a, b) => b.word.bbox.x0 - a.word.bbox.x0)[0];
}
