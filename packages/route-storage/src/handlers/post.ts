import { getMapFromDb, saveMapToDb, saveRouteToDb } from '../db';
import { type MapData, type RouteData } from '../types';
import { error, json, parseId } from '../utils';

export default async function handlePost(request: Request, env: Env, pathname: string) {
	const origin = new URL(request.url).origin;

	const routeId = parseId(pathname, 'routes');
	if (routeId) {
		const result = json(await createRoute(request, env, routeId), 201);
		await caches.default.delete(new Request(`${origin}/routes.json`));
		await caches.default.delete(new Request(`${origin}/routes/${routeId}.json`));
		return result;
	}

	const mapId = parseId(pathname, 'maps');
	if (mapId) {
		const result = json(await createMap(request, env, mapId), 201);
		await caches.default.delete(new Request(`${origin}/maps.json`));
		await caches.default.delete(new Request(`${origin}/maps/${mapId}.json`));
		return result;
	}

	return error('Not found', 404);
}

async function createRoute(request: Request, env: Env, id: string) {
	try {
		const body = await request.json<RouteData>();
		if (!body.name || !Array.isArray(body.maps)) {
			throw error('Invalid route data: requires name and maps array');
		}

		const routeData: RouteData = {
			id,
			name: body.name,
			owner: body.owner,
			maps: body.maps.map(String),
			mapsData: [],
		};

		for (const mapId of routeData.maps) {
			try {
				routeData.mapsData.push(await getMapFromDb(env, mapId));
			} catch {
				// Ignore missing map IDs; this matches previous behavior.
			}
		}

		await saveRouteToDb(env, routeData);
		return routeData;
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}

export async function createMap(request: Request, env: Env, id: string) {
	try {
		const body = await request.json<MapData>();
		if (!body.name || !Array.isArray(body.points)) {
			throw error('Invalid map data: requires name and points array');
		}

		const mapData: MapData = { id, ...body };
		await saveMapToDb(env, mapData);

		return mapData;
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}
