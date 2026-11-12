import { nanoid } from 'nanoid';

import { getAllMapsFromDb, saveMapToDb } from '../db';
import { cacheableJson, error, invalidateResourceCache, json } from '../utils';
import { handleMapIdEndpoint, parseMapBody } from './mapId';

export async function handleMapsEndpoint(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const mapId = getMapId(pathname);

	if (mapId) return handleMapIdEndpoint(request, env, mapId, ctx);

	switch (request.method) {
		case 'GET': {
			return cacheableJson(() => getAllMapsFromDb(env));
		}
		case 'POST': {
			const mapData = await parseMapBody(request, nanoid());
			await saveMapToDb(env, mapData);
			await invalidateResourceCache(ctx, 'maps');
			return json(mapData, 201);
		}
		default:
			return error('Method Not Allowed', 405);
	}
}

function getMapId(pathname: string) {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'maps' || parts.length > 2) return null;
	return parts[1] ?? null;
}
