import { nanoid } from 'nanoid';

import { deleteMapFromDb, getMapFromDb, saveMapToDb } from '../db';
import { type MapData } from '../types';
import { cacheableJson, error, invalidateResourceCache, json, toAssetKey } from '../utils';

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
	ctx: ExecutionContext,
) {
	switch (request.method) {
		case 'GET': {
			return cacheableJson(() => getMapFromDb(env, mapId));
		}
		case 'POST': {
			const mapData = await parseMapBody(request, mapId);
			await saveMapToDb(env, mapData);
			await invalidateResourceCache(ctx, 'maps');
			return json(mapData);
		}
		case 'PUT': {
			const existingMap = await getMapFromDb(env, mapId);
			const contentType = request.headers.get('Content-Type') || '';
			const response = contentType.startsWith('multipart/form-data')
				? await uploadMultipart(request, env, existingMap)
				: await uploadMedia(request, env, existingMap, contentType);
			await invalidateResourceCache(ctx, 'maps');
			return response;
		}
		case 'DELETE': {
			const { image, video } = await getMapFromDb(env, mapId);
			const assetKeys = [toAssetKey(image), toAssetKey(video)].filter(Boolean);
			if (assetKeys.length) await env.BUCKET.delete(assetKeys);
			await deleteMapFromDb(env, mapId);
			await invalidateResourceCache(ctx, 'maps');
			return json({ success: true, deleted: [...assetKeys, `maps/${mapId}`] });
		}
		default:
			return error('Method Not Allowed', 405);
	}
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

async function uploadMedia(request: Request, env: Env, mapData: MapData, contentType: string) {
	const ext = CONTENT_TYPE_TO_EXT[contentType];
	if (!ext) {
		return error(`Invalid content type. Allowed: ${Object.keys(CONTENT_TYPE_TO_EXT).join(', ')}`);
	}

	const type = contentType.startsWith('image/') ? 'image' : 'video';
	const key = `${nanoid()}.${ext}`;
	const oldAssetKey = toAssetKey(mapData[type]);
	const body = await request.arrayBuffer();
	await env.BUCKET.put(`assets/${key}`, body, { httpMetadata: { contentType } });
	if (oldAssetKey) await env.BUCKET.delete(oldAssetKey);
	mapData[type] = key;
	await saveMapToDb(env, mapData);

	return json({ success: true, key, url: `/assets/${key}` });
}

async function uploadMultipart(request: Request, env: Env, mapData: MapData) {
	const formData = await request.formData();
	const uploaded: { key: string; url: string }[] = [];
	const errors: string[] = [];
	const pending: {
		name: string;
		type: 'image' | 'video';
		key: string;
		file: File;
		contentType: string;
	}[] = [];
	const seenTypes = new Set<'image' | 'video'>();
	const oldAssetsByType = { image: toAssetKey(mapData.image), video: toAssetKey(mapData.video) };

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
		if (seenTypes.has(type)) {
			errors.push(`${name}: only one ${type} file can be uploaded at a time`);
			continue;
		}
		seenTypes.add(type);
		const key = `${nanoid()}.${ext}`;
		pending.push({ name, type, key, file: value, contentType: mappedType });
	}

	const completedUploads = await Promise.all(
		pending.map(async ({ type, key, file, contentType }) => {
			const buffer = await file.arrayBuffer();
			await env.BUCKET.put(`assets/${key}`, buffer, { httpMetadata: { contentType } });
			mapData[type] = key;
			return { key, url: `/assets/${key}` };
		}),
	);
	uploaded.push(...completedUploads);
	const replacedTypes = new Set(pending.map(({ type }) => type));
	const oldAssets = [...replacedTypes]
		.map((type) => oldAssetsByType[type])
		.filter((key): key is string => Boolean(key));
	await saveMapToDb(env, mapData);
	if (oldAssets.length) await env.BUCKET.delete(oldAssets);

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
