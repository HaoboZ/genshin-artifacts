export type Point = {
	x: number;
	y: number;
	marked?: number;
	start?: number;
	end?: number;
};

export type Spot = {
	point: { x: number; y: number };
	pointIndex?: number;
	percentage?: number;
};
