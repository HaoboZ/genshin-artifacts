import { error, invalidateCache, json, parseId } from '../utils';
import { getMap } from './get';

type CleanupResult = {
	success: true;
	usedAssetKeys: string[];
	deleted: string[];
	totalScannedMaps: number;
};

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

	if (pathname === '/' || pathname === '') {
		const result = json(await deleteUnusedAssets(request, env, ctx));
		await caches.default.delete(new Request(`${origin}/maps.json`));
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

async function deleteUnusedAssets(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<CleanupResult> {
	const mapKeys = await listAllKeys(env, 'maps/');
	const usedAssets = new Set<string>();

	for (const mapKey of mapKeys) {
		const mapFile = await env.BUCKET.get(mapKey);
		if (!mapFile) continue;

		const mapData = await mapFile.json<{ image?: string; video?: string }>();
		const imageKey = toAssetKey(mapData.image);
		const videoKey = toAssetKey(mapData.video);

		if (imageKey) usedAssets.add(imageKey);
		if (videoKey) usedAssets.add(videoKey);
	}

	const allBucketKeys = await listAllKeys(env);
	const removableKeys = allBucketKeys.filter((key) => {
		if (key.startsWith('maps/') || key.startsWith('routes/')) return false;
		return !usedAssets.has(key);
	});

	if (removableKeys.length > 0) {
		await env.BUCKET.delete(removableKeys);
		invalidateCache(ctx, request.url, removableKeys);
	}

	return {
		success: true,
		usedAssetKeys: [...usedAssets].sort(),
		deleted: removableKeys.sort(),
		totalScannedMaps: mapKeys.length,
	};
}

async function listAllKeys(env: Env, prefix?: string) {
	const keys: string[] = [];
	let cursor: string | undefined;

	do {
		const page = await env.BUCKET.list({ prefix, cursor });
		keys.push(...page.objects.map((obj) => obj.key));
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	return keys;
}

function toAssetKey(key?: string) {
	if (!key) return undefined;
	if (key.startsWith('assets/')) return key;
	return `assets/${key}`;
}
