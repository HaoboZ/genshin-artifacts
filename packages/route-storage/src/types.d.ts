declare global {
	interface CacheStorage {
		default: Cache;
	}
}

export type MapType = 'normal' | 'extend' | 'scan';

export type BackgroundType =
	| 'mondstadt'
	| 'liyue'
	| 'inazuma'
	| 'sumeru'
	| 'fontaine'
	| 'natlan'
	| 'snezhnaya';

export type Point = {
	x: number;
	y: number;
	type?: string;
	marked?: number;
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

export type RouteData = {
	id: string;
	name: string;
	owner?: string;
	maps: string[];
	mapsData?: MapData[];
};
