import data from '@/public/data/routes.json';

export const routesInfo: Route[] = data;

export type Route = {
	spots: number;
	artifacts: number;
	mora: number;
	exp: number;
	maps: Map[];
};

export type Map = {
	src: string;
	start: number;
	spots: number;
	text?: { x: number; y: number; text: string; size?: number }[];
};
