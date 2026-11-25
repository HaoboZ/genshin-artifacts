import { requireAuth } from './auth';
import { handleAssetRequest } from './handlers/assets';
import { handleCacheClear } from './handlers/cache';
import { handleMapsEndpoint } from './handlers/maps';
import { handleNotificationsEndpoint } from './handlers/notifications';
import { handleRoutesEndpoint } from './handlers/routes';
import { error } from './utils';

export default {
	async fetch(request, env, ctx) {
		const pathname = new URL(request.url).pathname;

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '604800',
				},
			});
		}

		try {
			let user = null;
			if (request.method !== 'GET' || pathname === '/auth' || pathname === '/notifications') {
				const authResult = await requireAuth(request, env);
				if (authResult instanceof Response) return addCors(authResult);
				user = authResult;
			}
			let response: Response;
			if (pathname === '/auth' && request.method === 'GET') {
				response = new Response(JSON.stringify(user), {
					headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
				});
			} else if (pathname === '/cache/clear') {
				response = await handleCacheClear(request, ctx);
			} else if (pathname === '/notifications' || /^\/notifications\/[^/]+$/.test(pathname)) {
				response = await handleNotificationsEndpoint(request, env, pathname, user);
			} else if (pathname === '/routes' || /^\/routes\/[^/]+$/.test(pathname)) {
				response = await handleRoutesEndpoint(request, env, pathname, ctx, user);
			} else if (pathname === '/maps' || /^\/maps\/[^/]+$/.test(pathname)) {
				response = await handleMapsEndpoint(request, env, pathname, ctx, user);
			} else if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
				response = await handleAssetRequest(request, env, pathname);
			} else {
				response = error('Not found', 404);
			}

			return addCors(response);
		} catch (errorResponse) {
			if (errorResponse instanceof Response) return addCors(errorResponse);
			console.error('ERROR:', errorResponse);
			return addCors(error('Internal server error', 500));
		}
	},
} satisfies ExportedHandler<Env>;

function addCors(response: Response) {
	const headers = new Headers(response.headers);
	headers.set('Access-Control-Allow-Origin', '*');
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
