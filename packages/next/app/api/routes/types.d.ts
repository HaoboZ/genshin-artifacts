import type { Point } from '@/components/imageRoute/types';

export type BackgroundType =
	| 'mondstadt'
	| 'liyue'
	| 'inazuma'
	| 'sumeru'
	| 'fontaine'
	| 'natlan'
	| 'snezhnaya';

export type MapType = 'normal' | 'extend' | 'scan';

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
	type?: MapType;
	text?: { text: string; x: number; y: number; fontSize?: number }[];
	background?: BackgroundType;
	spots?: number;
	time?: number;
	count?: number;
	mora?: number;
	efficiency?: number;
	x?: number;
	y?: number;
	image?: string;
	video?: string;
	points: Point[];
};
