import type { ComponentType, Dispatch, HTMLAttributes, ReactNode, RefObject } from 'react';

export type Point = {
	x: number;
	y: number;
	marked?: number;
	start?: number;
	end?: number;
	type?: string;
	extra?: string;
};

export type Spot = {
	point: { x: number; y: number };
	pointIndex?: number;
	percentage?: number;
};

export type ImageMapRouteProps = {
	ref?: RefObject<HTMLDivElement>;
	points: Point[];
	addPoint?: Dispatch<Point>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
	followActiveSpot?: boolean;
	RenderPoint?: ComponentType<RenderPointProps>;
	RenderPath?: ComponentType<RenderPathProps>;
	RenderExtra?: ComponentType<RenderExtraProps>;
	deps?: string;
	getInitialPosition?: (containerSize: DOMRect) => {
		scale?: number;
		offset?: { x: number; y: number };
	};
	getAnimatedPosition?: (containerSize: DOMRect) => {
		scale?: number;
		offset?: { x: number; y: number };
	};
	/**
	 * The natural width divided by the natural height of an image rendered with
	 * `object-fit: contain`. Coordinates are drawn against the contained image,
	 * rather than any letterboxing in the route container.
	 */
	imageAspectRatio?: number;
	innerChildren?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export type RenderPointProps = {
	point: Point;
	containerSize: DOMRect;
	scale: number;
	percentage?: number;
	type?: string;
};

export type RenderPathProps = {
	point1: Point;
	point2: Point;
	containerSize: DOMRect;
	scale: number;
};

export type RenderExtraProps = {
	containerSize: DOMRect;
	scale: number;
	points: Point[];
};
