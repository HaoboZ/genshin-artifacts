import { pick } from 'remeda';
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

		const routeData: RouteData = { id, ...body, mapsData: [] };

		for (const mapId of routeData.maps) {
			const mapFile = await env.BUCKET.get(`maps/${mapId}.json`);
			if (mapFile) {
				routeData.mapsData.push(
					pick(await mapFile.json<any>(), ['x', 'y', 'name', 'type', 'spots', 'background']),
				);
			}
		}

		await env.BUCKET.put(`routes/${id}.json`, JSON.stringify(routeData), {
			httpMetadata: { contentType: 'application/json' },
		});

		return routeData;
	} catch {
		throw error('Invalid JSON body');
	}
}

export async function createMap(request: Request, env: Env, id: string) {
	try {
		const body = await request.json<MapData>();
		if (!body.name || !Array.isArray(body.points)) {
			throw error('Invalid route data: requires name and maps array');
		}

		const mapData: MapData = { id, ...body };
		await env.BUCKET.put(`maps/${id}.json`, JSON.stringify(mapData), {
			httpMetadata: { contentType: 'application/json' },
		});

		return mapData;
	} catch {
		throw error('Invalid JSON body');
	}
}
