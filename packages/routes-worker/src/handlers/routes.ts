import { nanoid } from 'nanoid';

import { getAllRoutesFromDb, saveRouteToDb } from '../db';
import { cacheableJson, error, invalidateResourceCache, json } from '../utils';
import { handleRouteIdEndpoint, parseRouteBody } from './routeId';

export async function handleRoutesEndpoint(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
) {
	const routeId = getRouteId(pathname);

	if (routeId) return handleRouteIdEndpoint(request, env, routeId, ctx);

	switch (request.method) {
		case 'GET': {
			return cacheableJson(() => getAllRoutesFromDb(env));
		}
		case 'POST': {
			const routeData = await parseRouteBody(request, nanoid());
			await saveRouteToDb(env, routeData);
			await invalidateResourceCache(ctx, 'routes');
			return json(routeData, 201);
		}
		default:
			return error('Method Not Allowed', 405);
	}
}

function getRouteId(pathname: string) {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'routes' || parts.length > 2) return null;
	return parts[1] ?? null;
}
