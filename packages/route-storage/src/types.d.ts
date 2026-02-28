declare global {
	interface CacheStorage {
		default: Cache;
	}
}

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

export type RouteData = {
	id: string;
	name: string;
	owner?: string;
	maps: string[];
	mapsData?: MapData[];
};
