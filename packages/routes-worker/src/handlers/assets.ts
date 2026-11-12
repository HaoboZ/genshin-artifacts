import { error } from '../utils';

export async function handleAssetRequest(request: Request, env: Env, pathname: string) {
	if (request.method !== 'GET') return error('Method Not Allowed', 405);

	const rangeHeader = request.headers.get('Range');

	const key = pathname.slice(1);
	const options: R2GetOptions = {};
	let requestedRange: { start: number; end?: number } | undefined;
	let assetSize: number | undefined;
	if (rangeHeader) {
		const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
		if (!match) return rangeNotSatisfiable();
		requestedRange = {
			start: Number(match[1]),
			end: match[2] === '' ? undefined : Number(match[2]),
		};
		if (
			!Number.isSafeInteger(requestedRange.start) ||
			(requestedRange.end !== undefined &&
				(!Number.isSafeInteger(requestedRange.end) ||
					requestedRange.end < requestedRange.start))
		) {
			return rangeNotSatisfiable();
		}
		const metadata = await env.BUCKET.head(key);
		if (!metadata) return error('Not Found', 404);
		assetSize = metadata.size;
		if (requestedRange.start >= assetSize) return rangeNotSatisfiable(assetSize);
		options.range = {
			offset: requestedRange.start,
			length:
				Math.min(requestedRange.end ?? assetSize - 1, assetSize - 1) - requestedRange.start + 1,
		};
	}

	const object = await env.BUCKET.get(key, options);
	if (!object) return error('Not Found', 404);

	const headers = new Headers({
		'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
		'Accept-Ranges': 'bytes',
		'ETag': object.etag,
		'Cache-Control': object.httpMetadata?.cacheControl || 'public, max-age=604800',
	});

	if (requestedRange) {
		const totalSize = assetSize ?? object.size;
		const start = requestedRange.start;
		const end = Math.min(requestedRange.end ?? totalSize - 1, totalSize - 1);
		headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
		headers.set('Content-Length', String(end - start + 1));
		return new Response(object.body, { status: 206, headers });
	}

	headers.set('Content-Length', String(object.size));
	return new Response(object.body, { headers });
}

function rangeNotSatisfiable(size?: number) {
	const headers = size === undefined ? undefined : { 'Content-Range': `bytes */${size}` };
	return new Response(null, { status: 416, headers });
}
