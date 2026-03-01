import { nanoid } from 'nanoid';
import { getAllMapsFromDb, saveMapToDb } from '../db';
import { error, invalidateResourceCache, json } from '../utils';
import { handleMapIdEndpoint, parseMapBody } from './mapId';

export async function handleMapsEndpoint(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const origin = new URL(request.url).origin;
	const mapId = getMapId(pathname);

	if (mapId) {
		return handleMapIdEndpoint(request, env, mapId, origin, ctx);
	}

	if (request.method === 'GET') {
		const cached = await caches.default.match(request.url);
		if (cached) return cached;

		const response = json(await getAllMapsFromDb(env));
		response.headers.set('Cache-Control', 'public, max-age=3600');
		await caches.default.put(request.url, response.clone());
		return response;
	}

	if (request.method === 'PUT') {
		const mapData = await parseMapBody(request, nanoid());
		await saveMapToDb(env, mapData);
		await invalidateResourceCache(origin, 'maps', mapData.id);
		return json(mapData, 201);
	}

	return error('Method Not Allowed', 405);
}

function getMapId(pathname: string) {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'maps' || parts.length > 2) return null;
	return parts[1] ?? null;
}
