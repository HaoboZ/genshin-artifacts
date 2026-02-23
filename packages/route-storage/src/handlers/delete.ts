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
	const key = `routes/${id}.json`;
	const exists = await env.BUCKET.head(key);

	if (!exists) throw error('Route not found', 404);

	await env.BUCKET.delete(key);
	return { success: true, deleted: key };
}

async function deleteMap(request: Request, env: Env, id: string, ctx: ExecutionContext) {
	const { image, video } = await getMap(env, id);

	const keys = [toAssetKey(image), toAssetKey(video), `maps/${id}.json`].filter(Boolean);
	await env.BUCKET.delete(keys);

	invalidateCache(ctx, request.url, keys);

	return { success: true, deleted: keys };
}
