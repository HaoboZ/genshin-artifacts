import type { AuthUser } from '../auth';
import { deleteRouteFromDb, getRouteFromDb, saveRouteToDb } from '../db';
import { type RouteData } from '../types';
import { cacheableJson, error, invalidateResourceCache, json } from '../utils';

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
	ctx: ExecutionContext,
	user: AuthUser,
) {
	switch (request.method) {
		case 'GET': {
			return cacheableJson(() => getRouteFromDb(env, routeId));
		}
		case 'POST': {
			const routeData = await parseRouteBody(request, routeId);
			let existing;
			try {
				existing = await getRouteFromDb(env, routeId);
			} catch (cause) {
				if (!(cause instanceof Response) || cause.status !== 404) throw cause;
			}
			if (existing && !user.admin && existing.owner !== user.email)
				return error('Forbidden', 403);
			if (!user.admin) routeData.owner = user.email;
			else routeData.owner = existing?.owner;
			await saveRouteToDb(env, routeData);
			await invalidateResourceCache(ctx, 'routes');
			return json(routeData);
		}
		case 'DELETE': {
			const existing = await getRouteFromDb(env, routeId);
			if (!user.admin && existing.owner !== user.email) return error('Forbidden', 403);
			await deleteRouteFromDb(env, routeId);
			await invalidateResourceCache(ctx, 'routes');
			return json({ success: true, deleted: `routes/${routeId}` });
		}
		default:
			return error('Method Not Allowed', 405);
	}
}
