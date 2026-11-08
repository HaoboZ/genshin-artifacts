import { deleteRouteFromDb, getRouteFromDb, saveRouteToDb } from '../db';
import { type RouteData } from '../types';
import { cachedJson, error, invalidateResourceCache, json } from '../utils';

export async function parseRouteBody(request: Request, id: string) {
	try {
		const body = await request.json<RouteData>();
		if (!body?.name || !Array.isArray(body.maps)) {
			throw error('Invalid route data: requires name and maps array');
		}

		return {
			id,
			name: body.name,
			owner: body.owner,
			notes: body.notes,
			maps: body.maps.map(String),
		} satisfies RouteData;
	} catch (cause) {
		if (cause instanceof Response) throw cause;
		throw error('Invalid JSON body');
	}
}

export async function handleRouteIdEndpoint(
	request: Request,
	env: Env,
	routeId: string,
	origin: string,
) {
	switch (request.method) {
		case 'GET': {
			return cachedJson(request, () => getRouteFromDb(env, routeId));
		}
		case 'POST': {
			const routeData = await parseRouteBody(request, routeId);
			await saveRouteToDb(env, routeData);
			await invalidateResourceCache(origin, 'routes', routeId);
			return json(routeData);
		}
		case 'DELETE': {
			await deleteRouteFromDb(env, routeId);
			await invalidateResourceCache(origin, 'routes', routeId);
			return json({ success: true, deleted: `routes/${routeId}` });
		}
		default:
			return error('Method Not Allowed', 405);
	}
}
