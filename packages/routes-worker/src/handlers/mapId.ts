import { nanoid } from 'nanoid';
import { prop } from 'remeda';
import { deleteMapFromDb, getMapFromDb, getRouteIdsByMapId, saveMapToDb } from '../db';
import { type MapData } from '../types';
import { error, invalidateCache, invalidateResourceCache, json, toAssetKey } from '../utils';

const ALLOWED_EXTENSIONS = {
	png: 'image/png',
	jpeg: 'image/jpg',
	webp: 'image/webp',
	gif: 'image/gif',
	mp4: 'video/mp4',
	webm: 'video/webm',
};

const CONTENT_TYPE_TO_EXT = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'video/mp4': 'mp4',
	'video/webm': 'webm',
};

export async function handleMapIdEndpoint(
	request: Request,
	env: Env,
	mapId: string,
	origin: string,
	ctx: ExecutionContext,
) {
	if (request.method === 'GET') {
		const cached = await caches.default.match(request.url);
		if (cached) return cached;

		const response = json(await getMapFromDb(env, mapId));
		response.headers.set('Cache-Control', 'public, max-age=3600');
		await caches.default.put(request.url, response.clone());
		return response;
	}

	if (request.method === 'POST') {
		const mapData = await parseMapBody(request, mapId);
		await saveMapToDb(env, mapData);
		await invalidateResourceCache(origin, 'maps', mapId);
		await invalidateRelatedRoutes(env, origin, mapId);
		return json(mapData);
	}

	if (request.method === 'PUT') {
		const existingMap = await getMapFromDb(env, mapId);
		const contentType = request.headers.get('Content-Type') || '';
		const response = contentType.startsWith('multipart/form-data')
			? await uploadMultipart(request, env, existingMap, ctx)
			: await uploadMedia(request, env, existingMap, contentType, ctx);
		await invalidateResourceCache(origin, 'maps', mapId);
		return response;
	}

	if (request.method === 'DELETE') {
		const impactedRouteIds = await getRouteIdsByMapId(env, mapId);
		const { image, video } = await getMapFromDb(env, mapId);
		const assetKeys = [toAssetKey(image), toAssetKey(video)].filter(Boolean);
		if (assetKeys.length) await env.BUCKET.delete(assetKeys);
		await deleteMapFromDb(env, mapId);
		invalidateCache(ctx, origin, [...assetKeys, `maps/${mapId}`]);

		await invalidateResourceCache(origin, 'maps', mapId);
		await Promise.all(
			impactedRouteIds.map((id) => invalidateResourceCache(origin, 'routes', id)),
		);
		return json({ success: true, deleted: [...assetKeys, `maps/${mapId}`] });
	}

	return error('Method Not Allowed', 405);
}

export async function parseMapBody(request: Request, id: string) {
	try {
		const body = await request.json<MapData>();
		if (!body?.name || !Array.isArray(body.points)) {
			throw error('Invalid map data: requires name and points array');
		}

		return { ...body, id };
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}

async function invalidateRelatedRoutes(env: Env, origin: string, mapId: string) {
	const routeIds = await getRouteIdsByMapId(env, mapId);
	await Promise.all(routeIds.map((id) => invalidateResourceCache(origin, 'routes', id)));
}

async function uploadMedia(
	request: Request,
	env: Env,
	mapData: MapData,
	contentType: string,
	ctx: ExecutionContext,
) {
	const ext = CONTENT_TYPE_TO_EXT[contentType];
	if (!ext) {
		return error(`Invalid content type. Allowed: ${Object.keys(CONTENT_TYPE_TO_EXT).join(', ')}`);
	}

	const type = contentType.startsWith('image/') ? 'image' : 'video';
	const key = `${nanoid()}.${ext}`;
	const body = await request.arrayBuffer();
	await env.BUCKET.put(`assets/${key}`, body, { httpMetadata: { contentType } });
	await env.BUCKET.delete(toAssetKey(mapData[type]));
	mapData[type] = key;
	await saveMapToDb(env, mapData);

	const origin = new URL(request.url).origin;
	invalidateCache(ctx, origin, [key]);
	return json({ success: true, key, url: `/assets/${key}` });
}

async function uploadMultipart(
	request: Request,
	env: Env,
	mapData: MapData,
	ctx: ExecutionContext,
) {
	const formData = await request.formData();
	const uploaded: { key: string; url: string }[] = [];
	const errors: string[] = [];
	const uploads: Promise<void>[] = [];

	for (const [name, value] of formData.entries()) {
		if (!(value instanceof File)) {
			errors.push(`${name}: not a file`);
			continue;
		}

		const ext = getExtension(value.name, value.type);
		if (!ext) {
			errors.push(`${name}: unsupported file type (${value.type || 'unknown'})`);
			continue;
		}

		const mappedType = ALLOWED_EXTENSIONS[ext];
		const type = mappedType.startsWith('image/') ? 'image' : 'video';
		const key = `${nanoid()}.${ext}`;

		uploads.push(
			value.arrayBuffer().then(async (buffer) => {
				await env.BUCKET.put(`assets/${key}`, buffer, {
					httpMetadata: { contentType: mappedType },
				});
				uploaded.push({ key, url: `/assets/${key}` });
				await env.BUCKET.delete(toAssetKey(mapData[type]));
				mapData[type] = key;
			}),
		);
	}

	await Promise.all(uploads);
	await saveMapToDb(env, mapData);

	if (uploaded.length > 0) {
		const origin = new URL(request.url).origin;
		invalidateCache(ctx, origin, uploaded.map(prop('key')));
	}

	return json({
		success: uploaded.length > 0,
		uploaded,
		errors: errors.length > 0 ? errors : undefined,
	});
}

function getExtension(filename: string, mimeType: string) {
	const extMatch = filename.match(/\.([a-z0-9]+)$/i);
	if (extMatch) {
		const ext = extMatch[1].toLowerCase();
		if (ALLOWED_EXTENSIONS[ext]) return ext;
	}

	return CONTENT_TYPE_TO_EXT[mimeType];
}
