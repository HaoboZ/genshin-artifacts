import { error } from '../utils';

export async function handleAssetRequest(request: Request, env: Env, pathname: string) {
	if (request.method !== 'GET') return error('Method Not Allowed', 405);

	const rangeHeader = request.headers.get('Range');
	if (!rangeHeader) {
		const cached = await caches.default.match(request.url);
		if (cached) return cached;
	}

	const options: R2GetOptions = {};
	if (rangeHeader) {
		const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
		if (match) {
			const start = parseInt(match[1]);
			const end = match[2] ? parseInt(match[2]) : undefined;
			options.range = { offset: start, length: end ? end - start + 1 : undefined };
		}
	}

	const key = pathname.slice(1);
	const object = await env.BUCKET.get(key, options);
	if (!object) return error('Not Found', 404);

	const headers = new Headers();
	headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
	headers.set('Accept-Ranges', 'bytes');
	headers.set('ETag', object.etag);
	headers.set('Cache-Control', object.httpMetadata?.cacheControl || 'public, max-age=604800');

	if (rangeHeader && options.range) {
		const range = options.range as { offset: number; length?: number };
		const end = range.length ? range.offset + range.length - 1 : object.size - 1;
		headers.set('Content-Range', `bytes ${range.offset}-${end}/${object.size}`);
		headers.set('Content-Length', (end - range.offset + 1).toString());
		return new Response(object.body, { status: 206, headers });
	}

	headers.set('Content-Length', object.size.toString());
	const response = new Response(object.body, { headers });
	if (!rangeHeader) await caches.default.put(request.url, response.clone());
	return response;
}
