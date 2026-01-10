declare global {
	interface CacheStorage {
		default: Cache;
	}
}

export type RouteData = {
	id: string;
	name: string;
	maps: string[];
	mapsData?: MapData[];
};

export type MapData = {
	id: string;
	name: string;
	owner?: string;
	image?: string;
	video?: string;
	points: any[];
};
