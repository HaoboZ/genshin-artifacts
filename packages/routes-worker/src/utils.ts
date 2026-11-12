export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	});
}

export function error(message: string, status = 400) {
	return json({ error: message }, status);
}

export async function cacheableJson(load: () => Promise<unknown>) {
	const response = json(await load());
	response.headers.set('Cache-Control', 'public, max-age=3600');
	return response;
}

export async function invalidateResourceCache(ctx: ExecutionContext, resource: 'routes' | 'maps') {
	const pathPrefixes = resource === 'maps' ? ['/maps', '/routes'] : ['/routes'];
	return purgeWorkerCache(ctx, pathPrefixes);
}

export async function purgeWorkerCache(ctx: ExecutionContext, pathPrefixes: string[]) {
	const result = await ctx.cache.purge({ pathPrefixes });
	if (!result.success) {
		console.error('Worker cache purge failed', result.errors);
		throw error('Worker cache purge failed', 502);
	}
	return result;
}

export function toAssetKey(key?: string) {
	if (!key) return undefined;
	if (key.startsWith('assets/')) return key;
	return `assets/${key}`;
}
