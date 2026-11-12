declare global {
	interface ExecutionContext {
		cache: {
			purge(options: {
				purgeEverything?: boolean;
				pathPrefixes?: string[];
				tags?: string[];
			}): Promise<{
				success: boolean;
				errors?: { code: number; message: string }[];
			}>;
		};
	}
}

export type MapType = 'extend' | 'extra';

export type BackgroundType =
	'mondstadt' | 'liyue' | 'inazuma' | 'sumeru' | 'fontaine' | 'natlan' | 'nod_krai' | 'snezhnaya';

export type Point = {
	x: number;
	y: number;
	type?: string;
	marked?: number;
};

export type Text = {
	text: string;
	x: number;
	y: number;
	fontSize?: number;
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
	mora?: number;
	time?: number;
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
	notes?: string;
	maps: string[];
	mapsData?: MapData[];
};
