export default {
	async fetch(request, env) {
		const key = decodeURIComponent(new URL(request.url).pathname.slice(1));

		if (!key) return new Response('R2 File Server');

		try {
			const range = request.headers.get('Range');

			// Get file metadata first
			const head = await env.MY_BUCKET.head(key);
			if (!head) return new Response('Not Found', { status: 404 });

			const fileSize = head.size;

			// Parse range - returns null if bytes=0- (full file request)
			const parsedRange = range ? parseRange(range, fileSize) : null;

			// Get the object
			const object = await env.MY_BUCKET.get(key, {
				range: parsedRange || undefined,
			});

			if (!object) return new Response('Not Found', { status: 404 });

			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);
			headers.set('Accept-Ranges', 'bytes');
			headers.set('Access-Control-Allow-Origin', '*');
			headers.set(
				'Access-Control-Expose-Headers',
				'Content-Range, Content-Length, Accept-Ranges',
			);
			headers.set('Cache-Control', 'public, max-age=2592000');

			// If this was a partial range request (not bytes=0- and not full file)
			if (range && parsedRange && object.range) {
				const { offset, length } = object.range as any;
				const end = offset + length - 1;

				headers.set('Content-Length', length.toString());
				headers.set('Content-Range', `bytes ${offset}-${end}/${fileSize}`);

				return new Response(object.body, { status: 206, headers });
			}

			// Full file request (either no range or bytes=0-)
			headers.set('Content-Length', fileSize.toString());
			return new Response(object.body, { status: 200, headers });
		} catch (error) {
			console.error('Error serving file:', error);
			return new Response('Internal Server Error: ' + error.message, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

function parseRange(range: string, fileSize: number): R2Range | null | undefined {
	// Handle "bytes=0-" as a full file request (return null to trigger status 200)
	if (range === 'bytes=0-') {
		return null;
	}

	// Handle suffix-range: "bytes=-500" (last 500 bytes)
	const suffixMatch = range.match(/bytes=-(\d+)/);
	if (suffixMatch) {
		const suffix = parseInt(suffixMatch[1]);
		return {
			offset: Math.max(0, fileSize - suffix),
			length: Math.min(suffix, fileSize),
		};
	}

	// Handle normal range: "bytes=0-1023" or "bytes=1024-"
	const match = range.match(/bytes=(\d+)-(\d*)/);
	if (!match) return undefined;

	const start = parseInt(match[1]);

	// Validate start position
	if (start >= fileSize) return undefined;

	if (match[2]) {
		// End specified: "bytes=0-1023"
		const end = parseInt(match[2]);
		return {
			offset: start,
			length: Math.min(end - start + 1, fileSize - start),
		};
	} else {
		// No end specified: "bytes=1024-" (read to end)
		return {
			offset: start,
			length: fileSize - start,
		};
	}
}
