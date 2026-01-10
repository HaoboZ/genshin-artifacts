import type { Point } from '@/components/imageRoute/types';

export type RouteData = {
	id: string;
	name: string;
	owner?: string;
	maps: string[];
	mapsData?: MapData[];
};

export type MapData = {
	id: string;
	name: string;
	owner?: string;
	type?: string;
	text?: { text: string; x: number; y: number; fontSize?: number }[];
	background?: string;
	spots?: number;
	x?: number;
	y?: number;
	image?: string;
	video?: string;
	points: Point[];
};
