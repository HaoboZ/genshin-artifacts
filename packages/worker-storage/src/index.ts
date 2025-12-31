export default {
	async fetch(request, env) {
		const key = decodeURIComponent(new URL(request.url).pathname.slice(1));

		if (!key) return new Response('R2 File Server');

		const range = request.headers.get('Range');
		const object = await env.MY_BUCKET.get(key, {
			range: range ? parseRange(range) : undefined,
		});

		if (!object) return new Response('Not Found', { status: 404 });

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		headers.set('Accept-Ranges', 'bytes');
		headers.set('Access-Control-Allow-Origin', '*');
		headers.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
		headers.set('Cache-Control', 'public, max-age=2592000');

		// CRITICAL: Add Content-Length
		headers.set('Content-Length', object.size.toString());

		// If this was a range request, add Content-Range header
		if (range && object.range) {
			const { offset, length } = object.range as { offset: number; length: number };
			const end = offset + length - 1;
			headers.set('Content-Range', `bytes ${offset}-${end}/${object.size}`);

			return new Response(object.body, { status: 206, headers });
		}

		return new Response(object.body, { status: 200, headers });
	},
} satisfies ExportedHandler<Env>;

function parseRange(range: string): R2Range | undefined {
	const match = range.match(/bytes=(\d+)-(\d*)/);
	if (!match) return undefined;

	const start = parseInt(match[1]);
	const end = match[2] ? parseInt(match[2]) : undefined;

	if (end !== undefined) {
		return { offset: start, length: end - start + 1 };
	} else {
		return { offset: start };
	}
}
