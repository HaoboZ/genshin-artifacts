import { deleteMapFromDb, deleteRouteFromDb } from '../db';
import { error, invalidateCache, json, parseId, toAssetKey } from '../utils';
import { getMap } from './get';

export default async function handleDelete(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const origin = new URL(request.url).origin;

	const routeId = parseId(pathname, 'routes');
	if (routeId) {
		const result = json(await deleteRoute(env, routeId));
		// Invalidate cache for routes list and the specific route
		await caches.default.delete(new Request(`${origin}/routes.json`));
		await caches.default.delete(new Request(`${origin}/routes/${routeId}.json`));
		return result;
	}

	const mapId = parseId(pathname, 'maps');
	if (mapId) {
		const result = json(await deleteMap(request, env, mapId, ctx));
		// Invalidate cache for maps list and the specific map
		await caches.default.delete(new Request(`${origin}/maps.json`));
		await caches.default.delete(new Request(`${origin}/maps/${mapId}.json`));
		return result;
	}

	return error('Not found', 404);
}

async function deleteRoute(env: Env, id: string) {
	await deleteRouteFromDb(env, id);
	return { success: true, deleted: `routes/${id}.json` };
}

async function deleteMap(request: Request, env: Env, id: string, ctx: ExecutionContext) {
	const { image, video } = await getMap(env, id);

	const assetKeys = [toAssetKey(image), toAssetKey(video)].filter(Boolean);
	if (assetKeys.length) await env.BUCKET.delete(assetKeys);
	await deleteMapFromDb(env, id);

	invalidateCache(ctx, request.url, [...assetKeys, `maps/${id}.json`]);

	return { success: true, deleted: [...assetKeys, `maps/${id}.json`] };
}
