import { deleteMapFromDb, deleteRouteFromDb, getRouteIdsByMapId } from '../db';
import {
	error,
	invalidateCache,
	invalidateResourceCache,
	json,
	normalizeResourcePath,
	toAssetKey,
} from '../utils';
import { getMapFromDb } from '../db';

export default async function handleDelete(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const normalizedPath = normalizeResourcePath(pathname);
	const origin = new URL(request.url).origin;

	const routeId = getId(normalizedPath, 'routes');
	if (routeId) {
		const result = json(await deleteRoute(env, routeId));
		await invalidateResourceCache(origin, 'routes', routeId);
		return result;
	}

	const mapId = getId(normalizedPath, 'maps');
	if (mapId) {
		const impactedRouteIds = await getRouteIdsByMapId(env, mapId);
		const result = json(await deleteMap(request, env, mapId, ctx));
		await invalidateResourceCache(origin, 'maps', mapId);
		await Promise.all(
			impactedRouteIds.map((id) => invalidateResourceCache(origin, 'routes', id)),
		);
		return result;
	}

	return error('Not found', 404);
}

async function deleteRoute(env: Env, id: string) {
	await deleteRouteFromDb(env, id);
	return { success: true, deleted: `routes/${id}` };
}

async function deleteMap(request: Request, env: Env, id: string, ctx: ExecutionContext) {
	const { image, video } = await getMapFromDb(env, id);

	const assetKeys = [toAssetKey(image), toAssetKey(video)].filter(Boolean);
	if (assetKeys.length) await env.BUCKET.delete(assetKeys);
	await deleteMapFromDb(env, id);

	invalidateCache(ctx, request.url, [...assetKeys, `maps/${id}`]);

	return { success: true, deleted: [...assetKeys, `maps/${id}`] };
}

function getId(pathname: string, resource: 'routes' | 'maps') {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== resource || !parts[1] || parts.length !== 2) return null;
	return parts[1];
}
