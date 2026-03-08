import type { Point } from '@/components/imageRoute/types';

export type BackgroundType =
	| 'none'
	| 'mondstadt'
	| 'liyue'
	| 'inazuma'
	| 'sumeru'
	| 'fontaine'
	| 'natlan'
	| 'nod_krai';

export type MapType = 'none' | 'extend' | 'scan';

export type RouteData = {
	id: string;
	name: string;
	owner?: string;
	notes?: string;
	maps: string[];
	mapsData?: MapData[];
};

export type MapData = {
	id: string;
	name: string;
	owner?: string;
	notes?: string;
	type?: MapType;
	text?: Text[];
	background?: BackgroundType;
	spots?: number;
	time?: number;
	mora?: number;
	efficiency?: number;
	x?: number | null;
	y?: number | null;
	image?: string;
	video?: string;
	points?: Point[];
};

export type Text = {
	text: string;
	x: number;
	y: number;
	fontSize?: number;
};
