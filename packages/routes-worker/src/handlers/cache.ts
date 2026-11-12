import { error, json } from '../utils';

export async function handleCacheClear(request: Request, env: Env) {
	if (request.method !== 'POST') return error('Method Not Allowed', 405);

	const origin = new URL(request.url).origin;
	const cacheUrls = new Set<string>([`${origin}/routes`, `${origin}/maps`]);
	const [routes, maps] = await Promise.all([
		env.DB.prepare('SELECT id FROM routes').all<{ id: string }>(),
		env.DB.prepare('SELECT id FROM maps').all<{ id: string }>(),
	]);

	for (const { id } of routes.results) cacheUrls.add(`${origin}/routes/${encodeURIComponent(id)}`);
	for (const { id } of maps.results) cacheUrls.add(`${origin}/maps/${encodeURIComponent(id)}`);

	const urls = [...cacheUrls];
	let deleted = 0;
	for (let index = 0; index < urls.length; index += 100) {
		const results = await Promise.all(
			urls.slice(index, index + 100).map((url) => caches.default.delete(url)),
		);
		deleted += results.filter(Boolean).length;
	}

	return json({ success: true, checked: urls.length, deleted });
}
