export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function error(message: string, status = 400) {
	return json({ error: message }, status);
}

export function parseId(pathname: string, prefix: string) {
	const parts = pathname.split('/');
	if (parts[1] !== prefix) return null;
	return parts[2].slice(0, -5);
}

export function invalidateCache(ctx: ExecutionContext, requestUrl: string, keys: string[]) {
	const url = new URL(requestUrl);
	ctx.waitUntil(
		Promise.all(
			keys.map((key) => caches.default.delete(new Request(`${url.origin}/data/${key}`))),
		),
	);
}
