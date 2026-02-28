import { getAllMapsFromDb, getAllRoutesFromDb, getMapFromDb, getRouteFromDb } from '../db';
import { error, json, parseId } from '../utils';

export default async function handleGet(request: Request, env: Env, pathname: string) {
	if (!request.headers.get('Range')) {
		const cached = await caches.default.match(request.url);
		if (cached) return cached;
	}

	let response: Response;

	if (pathname === '/routes.json') response = json(await getAllRoutesFromDb(env));
	if (!response) {
		const routeId = parseId(pathname, 'routes');
		if (routeId) response = json(await getRouteFromDb(env, routeId));
	}

	if (pathname === '/maps.json') response = json(await getAllMapsFromDb(env));
	if (!response) {
		const mapId = parseId(pathname, 'maps');
		if (mapId) response = json(await getMapFromDb(env, mapId));
	}

	if (response) {
		response.headers.set('Cache-Control', 'public, max-age=3600');
		caches.default.put(request.url, response.clone());
		return response;
	}

	if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
		const key = pathname.slice(1);
		return await getData(request, env, key);
	}

	return error('Not found', 404);
}

export async function getMap(env: Env, id: string) {
	return getMapFromDb(env, id);
}

async function getData(request: Request, env: Env, key: string) {
	const rangeHeader = request.headers.get('Range');

	const options: R2GetOptions = {};
	if (rangeHeader) {
		const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
		if (match) {
			const start = parseInt(match[1]);
			const end = match[2] ? parseInt(match[2]) : undefined;
			options.range = { offset: start, length: end ? end - start + 1 : undefined };
		}
	}

	const object = await env.BUCKET.get(key, options);
	if (!object) {
		return error('Not Found', 404);
	}

	const headers = new Headers();
	const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
	headers.set('Content-Type', contentType);
	headers.set('Accept-Ranges', 'bytes');
	headers.set('ETag', object.etag);

	if (object.httpMetadata?.cacheControl) {
		headers.set('Cache-Control', object.httpMetadata.cacheControl);
	} else {
		headers.set('Cache-Control', 'public, max-age=604800');
	}

	if (rangeHeader && options.range) {
		const range = options.range as { offset: number; length?: number };
		const end = range.length ? range.offset + range.length - 1 : object.size - 1;
		headers.set('Content-Range', `bytes ${range.offset}-${end}/${object.size}`);
		headers.set('Content-Length', (end - range.offset + 1).toString());
		return new Response(object.body, { status: 206, headers });
	}

	headers.set('Content-Length', object.size.toString());
	const response = new Response(object.body, { headers });

	if (!rangeHeader) {
		caches.default.put(request.url, response.clone());
	}

	return response;
}
