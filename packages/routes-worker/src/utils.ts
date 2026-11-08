export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function error(message: string, status = 400) {
	return json({ error: message }, status);
}

export async function cachedJson(request: Request, load: () => Promise<unknown>) {
	const cacheUrl = new URL(request.url);
	cacheUrl.search = '';
	const cacheKey = new Request(cacheUrl, request);
	const cached = await caches.default.match(cacheKey);
	if (cached) return cached;

	const response = json(await load());
	response.headers.set('Cache-Control', 'public, max-age=3600');
	await caches.default.put(cacheKey, response.clone());
	return response;
}

export async function invalidateResourceCache(
	origin: string,
	resource: 'routes' | 'maps',
	id?: string,
) {
	const keys = [
		`${origin}/${resource}`,
		id ? `${origin}/${resource}/${encodeURIComponent(id)}` : null,
	].filter(Boolean) as string[];
	await Promise.all(keys.map((key) => caches.default.delete(key)));
}

export function invalidateCache(ctx: ExecutionContext, origin: string, keys: string[]) {
	ctx.waitUntil(Promise.all(keys.map((key) => caches.default.delete(`${origin}/${key}`))));
}

export function toAssetKey(key?: string) {
	if (!key) return undefined;
	if (key.startsWith('assets/')) return key;
	return `assets/${key}`;
}
