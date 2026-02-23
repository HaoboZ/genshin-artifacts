import { nanoid } from 'nanoid';
import { prop } from 'remeda';
import { error, invalidateCache, json, toAssetKey } from '../utils';
import { getMap } from './get';

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

export async function handlePut(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const parts = pathname.split('/');
	if (parts[1] !== 'maps' || !parts[2]) return error('Not found', 404);

	const contentType = request.headers.get('Content-Type') || '';

	const mapExists = await env.BUCKET.head(`maps/${parts[2]}`);
	if (!mapExists) return error('Map not found. Create the map first.', 404);
	const mapId = parts[2].slice(0, -5);

	if (contentType.startsWith('multipart/form-data')) {
		return await uploadMultipart(request, env, mapId, ctx);
	}

	return await uploadMedia(request, env, mapId, contentType, ctx);
}

async function uploadMedia(
	request: Request,
	env: Env,
	mapId: string,
	contentType: string,
	ctx: ExecutionContext,
) {
	const ext = CONTENT_TYPE_TO_EXT[contentType];
	if (!ext) {
		return error(`Invalid content type. Allowed: ${Object.keys(CONTENT_TYPE_TO_EXT).join(', ')}`);
	}

	const mapData = await getMap(env, mapId);

	const type = contentType.startsWith('image/') ? 'image' : 'video';
	const key = `${nanoid()}.${ext}`;

	const body = await request.arrayBuffer();
	await env.BUCKET.put(`assets/${key}`, body, { httpMetadata: { contentType } });
	await env.BUCKET.delete(toAssetKey(mapData[type]));
	mapData[type] = key;
	await env.BUCKET.put(`maps/${mapId}.json`, JSON.stringify(mapData), {
		httpMetadata: { contentType: 'application/json' },
	});

	invalidateCache(ctx, request.url, [key]);

	return json({ success: true, key, url: `/assets/${key}` });
}

async function uploadMultipart(request: Request, env: Env, mapId: string, ctx: ExecutionContext) {
	const formData = await request.formData();
	const uploaded: { key: string; url: string }[] = [];
	const errors: string[] = [];

	const mapData = await getMap(env, mapId);

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

		const contentType = ALLOWED_EXTENSIONS[ext];
		const type = contentType.startsWith('image/') ? 'image' : 'video';
		const key = `${nanoid()}.${ext}`;

		uploads.push(
			value.arrayBuffer().then(async (buffer) => {
				await env.BUCKET.put(`assets/${key}`, buffer, { httpMetadata: { contentType } });
				uploaded.push({ key, url: `/assets/${key}` });
				await env.BUCKET.delete(toAssetKey(mapData[type]));
				mapData[type] = key;
			}),
		);
	}

	await Promise.all(uploads);
	await env.BUCKET.put(`maps/${mapId}.json`, JSON.stringify(mapData), {
		httpMetadata: { contentType: 'application/json' },
	});

	if (uploaded.length > 0) {
		invalidateCache(ctx, request.url, uploaded.map(prop('key')));
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
