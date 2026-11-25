import { nanoid } from 'nanoid';

import type { AuthUser } from '../auth';
import { getAllRoutesFromDb, saveRouteToDb } from '../db';
import { cacheableJson, error, invalidateResourceCache, json } from '../utils';
import { handleRouteIdEndpoint, parseRouteBody } from './routeId';

export async function handleRoutesEndpoint(
	request: Request,
	env: Env,
	pathname: string,
	ctx: ExecutionContext,
	user: AuthUser | null,
) {
	const routeId = getRouteId(pathname);

	if (routeId) return handleRouteIdEndpoint(request, env, routeId, ctx, user!);

	switch (request.method) {
		case 'GET': {
			return cacheableJson(() => getAllRoutesFromDb(env));
		}
		case 'POST': {
			const routeData = await parseRouteBody(request, nanoid());
			routeData.owner = user!.admin ? undefined : user!.email;
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
