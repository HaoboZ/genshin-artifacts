import { nanoid } from 'nanoid';
import { getAllRoutesFromDb, saveRouteToDb } from '../db';
import { error, invalidateResourceCache, json } from '../utils';
import { handleRouteIdEndpoint, parseRouteBody } from './routeId';

export async function handleRoutesEndpoint(request: Request, env: Env, pathname: string) {
	const origin = new URL(request.url).origin;
	const routeId = getRouteId(pathname);

	if (routeId) {
		return handleRouteIdEndpoint(request, env, routeId, origin);
	}

	if (request.method === 'GET') {
		const cached = await caches.default.match(request.url);
		if (cached) return cached;

		const response = json(await getAllRoutesFromDb(env));
		response.headers.set('Cache-Control', 'public, max-age=3600');
		await caches.default.put(request.url, response.clone());
		return response;
	}

	if (request.method === 'PUT') {
		const routeData = await parseRouteBody(request, nanoid());
		await saveRouteToDb(env, routeData);
		await invalidateResourceCache(origin, 'routes', routeData.id);
		return json(routeData, 201);
	}

	return error('Method Not Allowed', 405);
}

function getRouteId(pathname: string) {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'routes' || parts.length > 2) return null;
	return parts[1] ?? null;
}
