export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function error(message: string, status = 400) {
	return json({ error: message }, status);
}

export function normalizeResourcePath(pathname: string) {
	if (!pathname.endsWith('.json')) return pathname;
	return pathname.slice(0, -5);
}

export async function invalidateResourceCache(
	origin: string,
	resource: 'routes' | 'maps',
	id?: string,
) {
	const keys = [
		`${origin}/${resource}`,
		`${origin}/${resource}.json`,
		id ? `${origin}/${resource}/${id}` : null,
		id ? `${origin}/${resource}/${id}.json` : null,
	].filter(Boolean) as string[];
	await Promise.all(keys.map((key) => caches.default.delete(new Request(key))));
}

export function invalidateCache(ctx: ExecutionContext, requestUrl: string, keys: string[]) {
	const url = new URL(requestUrl);
	ctx.waitUntil(
		Promise.all(
			keys.map((key) => caches.default.delete(new Request(`${url.origin}/data/${key}`))),
		),
	);
}

export function toAssetKey(key?: string) {
	if (!key) return undefined;
	if (key.startsWith('assets/')) return key;
	return `assets/${key}`;
}
