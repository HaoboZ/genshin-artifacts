import { error, json, purgeWorkerCache } from '../utils';

export async function handleCacheClear(request: Request, ctx: ExecutionContext) {
	if (request.method !== 'POST') return error('Method Not Allowed', 405);

	await purgeWorkerCache(ctx, ['/routes', '/maps']);
	return json({ success: true, purged: ['/routes', '/maps'] });
}
