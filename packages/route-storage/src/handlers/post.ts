import { getRouteIdsByMapId, saveMapToDb, saveRouteToDb } from '../db';
import { type MapData, type RouteData } from '../types';
import { error, invalidateResourceCache, json, normalizeResourcePath } from '../utils';

export default async function handlePost(request: Request, env: Env, pathname: string) {
	const normalizedPath = normalizeResourcePath(pathname);
	const origin = new URL(request.url).origin;

	const routeId = getId(normalizedPath, 'routes');
	if (routeId) {
		const routeData = await updateRoute(request, env, routeId);
		await invalidateResourceCache(origin, 'routes', routeId);
		return json(routeData);
	}

	const mapId = getId(normalizedPath, 'maps');
	if (mapId) {
		const mapData = await updateMap(request, env, mapId);
		await invalidateResourceCache(origin, 'maps', mapId);
		const impactedRouteIds = await getRouteIdsByMapId(env, mapId);
		await Promise.all(
			impactedRouteIds.map((id) => invalidateResourceCache(origin, 'routes', id)),
		);
		return json(mapData);
	}

	return error('Not found', 404);
}

async function updateRoute(request: Request, env: Env, id: string) {
	try {
		const body = await request.json<RouteData>();
		if (!body?.name || !Array.isArray(body.maps)) {
			throw error('Invalid route data: requires name and maps array');
		}

		const routeData: RouteData = {
			id,
			name: body.name,
			owner: body.owner,
			maps: body.maps.map(String),
		};
		await saveRouteToDb(env, routeData);
		return routeData;
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}

async function updateMap(request: Request, env: Env, id: string) {
	try {
		const body = await request.json<MapData>();
		if (!body?.name || !Array.isArray(body.points)) {
			throw error('Invalid map data: requires name and points array');
		}

		const mapData: MapData = { ...body, id };
		await saveMapToDb(env, mapData);
		return mapData;
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}

function getId(pathname: string, resource: 'routes' | 'maps') {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== resource || !parts[1] || parts.length !== 2) return null;
	return parts[1];
}
