export type Point = {
	x: number;
	y: number;
	marked?: number;
	start?: number;
	end?: number;
	data?: string;
};

export type Spot = {
	point: { x: number; y: number };
	pointIndex?: number;
	percentage?: number;
};

export type RenderPointProps = {
	point: Point;
	containerSize: DOMRect;
	scale?: number;
	percentage?: number;
	type?: string;
};

export type RenderPathProps = {
	point1: Point;
	point2: Point;
	containerSize: DOMRect;
};
