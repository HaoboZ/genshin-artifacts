declare const caches: {
	default: Cache;
};

export default {
	async fetch(request, env) {
		const key = decodeURIComponent(new URL(request.url).pathname.slice(1));

		if (!key) return new Response('R2 File Server');

		try {
			const head = await env.MY_BUCKET.head(key);
			if (!head) {
				return new Response(request.method === 'HEAD' ? null : 'Not Found', {
					status: 404,
				});
			}

			const fileSize = head.size;
			const rangeHeader = request.headers.get('Range');

			if (request.method === 'HEAD') {
				const headers = new Headers();
				setCommonHeaders(headers, head);
				headers.set('Content-Length', fileSize.toString());
				return new Response(null, { status: 200, headers });
			}

			// for non-range requests, use Cloudflare cache
			if (!rangeHeader) {
				const cache = caches.default;
				const cacheKey = new Request(request.url, { method: 'GET' });

				const cachedResponse = await cache.match(cacheKey);
				if (cachedResponse) return cachedResponse;

				const object = await env.MY_BUCKET.get(key);
				if (!object) return new Response('Not Found', { status: 404 });

				const headers = new Headers();
				setCommonHeaders(headers, object);
				headers.set('Content-Length', fileSize.toString());
				headers.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length');

				const response = new Response(object.body, { status: 200, headers });
				await cache.put(cacheKey, response.clone());
				return response;
			}

			// handle range requests (not cached)
			const parsedRange = parseRange(rangeHeader, fileSize);
			if (!parsedRange) {
				return new Response('Invalid Range', {
					status: 416,
					headers: { 'Content-Range': `bytes */${fileSize}` },
				});
			}

			const object = await env.MY_BUCKET.get(key, { range: parsedRange });
			if (!object?.range) {
				return new Response('Not Found', { status: 404 });
			}

			const { offset, length } = object.range as any;
			const headers = new Headers();
			setCommonHeaders(headers, object);
			headers.set('Content-Length', length.toString());
			headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${fileSize}`);
			headers.set(
				'Access-Control-Expose-Headers',
				'Content-Range, Content-Length, Accept-Ranges',
			);

			return new Response(object.body, { status: 206, headers });
		} catch (error) {
			console.error('ERROR:', error);
			return new Response('Internal Server Error: ' + error.message, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

function setCommonHeaders(headers: Headers, object: R2Object) {
	if (object?.writeHttpMetadata) object.writeHttpMetadata(headers);
	if (object?.httpEtag) headers.set('etag', object.httpEtag);
	headers.set('Accept-Ranges', 'bytes');
	headers.set('Access-Control-Allow-Origin', '*');

	if (object?.httpMetadata?.contentType) {
		const contentType = object.httpMetadata.contentType;
		if (contentType.startsWith('image/')) {
			headers.set('Cache-Control', 'public, max-age=604800');
		}
	}
}

function parseRange(range: string, fileSize: number): R2Range {
	const suffixMatch = range.match(/bytes=-(\d+)/);
	if (suffixMatch) {
		const suffix = parseInt(suffixMatch[1]);
		return { offset: Math.max(0, fileSize - suffix), length: Math.min(suffix, fileSize) };
	}

	const match = range.match(/bytes=(\d+)-(\d*)/);
	if (!match) {
		console.info('No match for range pattern');
		return null;
	}

	const start = parseInt(match[1]);
	if (start >= fileSize) return null;

	const end = match[2] ? parseInt(match[2]) : fileSize - 1;
	return { offset: start, length: Math.min(end - start + 1, fileSize - start) };
}
