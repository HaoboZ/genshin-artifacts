export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function error(message: string, status = 400) {
	return json({ error: message }, status);
}

export async function invalidateResourceCache(
	origin: string,
	resource: 'routes' | 'maps',
	id?: string,
) {
	const keys = [`${origin}/${resource}`, id ? `${origin}/${resource}/${id}` : null].filter(
		Boolean,
	) as string[];
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
