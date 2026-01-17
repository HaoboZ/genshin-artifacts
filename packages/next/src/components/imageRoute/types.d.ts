import type { BoxProps } from '@mui/material';
import type { ComponentType, Dispatch, ReactNode, RefObject } from 'react';

export type Point = {
	x: number;
	y: number;
	marked?: number;
	start?: number;
	end?: number;
	type?: string;
};

export type Spot = {
	point: { x: number; y: number };
	pointIndex?: number;
	percentage?: number;
};

export type ImageRouteProps = {
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
	innerChildren?: ReactNode;
} & BoxProps;

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
