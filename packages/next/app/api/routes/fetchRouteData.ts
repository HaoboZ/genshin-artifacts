import axios from 'axios';

import type { MapData, RouteData } from './types';

function endpoint(path: string) {
	const baseUrl = process.env.NEXT_PUBLIC_ROUTE_URL;
	if (!baseUrl) throw new Error('NEXT_PUBLIC_ROUTE_URL is not configured');
	return `${baseUrl.replace(/\/$/, '')}/${path}`;
}

export const routesUrl = () => endpoint('routes');
export const routeUrl = (id: string) => endpoint(`routes/${encodeURIComponent(id)}`);
export const mapsUrl = () => endpoint('maps');
export const mapUrl = (id: string) => endpoint(`maps/${encodeURIComponent(id)}`);

export async function fetchRoutes() {
	const { data } = await axios.get<RouteData[]>(routesUrl());
	return data;
}

export async function fetchRoute(id: string) {
	const { data } = await axios.get<RouteData>(routeUrl(id));
	return data;
}

export async function fetchMaps() {
	const { data } = await axios.get<MapData[]>(mapsUrl());
	return data;
}

export async function fetchMap(id: string) {
	const { data } = await axios.get<MapData>(mapUrl(id));
	return data;
}
