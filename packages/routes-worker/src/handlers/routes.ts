import { nanoid } from 'nanoid';

import { getAllRoutesFromDb, saveRouteToDb } from '../db';
import { cachedJson, error, invalidateResourceCache, json } from '../utils';
import { handleRouteIdEndpoint, parseRouteBody } from './routeId';

export async function handleRoutesEndpoint(request: Request, env: Env, pathname: string) {
	const origin = new URL(request.url).origin;
	const routeId = getRouteId(pathname);

	if (routeId) return handleRouteIdEndpoint(request, env, routeId, origin);

	switch (request.method) {
		case 'GET': {
			return cachedJson(request, () => getAllRoutesFromDb(env));
		}
		case 'POST': {
			const routeData = await parseRouteBody(request, nanoid());
			await saveRouteToDb(env, routeData);
			await invalidateResourceCache(origin, 'routes', routeData.id);
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
