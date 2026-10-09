export type OcrBox = { x0: number; y0: number; x1: number; y1: number };
export type OcrWord = { text: string; bbox: OcrBox };
export type OcrLine = { text: string; bbox: OcrBox; words: OcrWord[] };
export type OcrBlocks = {
	blocks?: Array<{
		paragraphs: Array<{ lines: OcrLine[] }>;
	}> | null;
};

export type PanelRectangle = { left: number; top: number; width: number; height: number };
export type ArtifactPanelAnchor = { line: OcrLine; word: OcrWord };
