import { requireAuth } from './auth';
import { handleAssetRequest } from './handlers/assets';
import { handleMapsEndpoint } from './handlers/maps';
import { handleRoutesEndpoint } from './handlers/routes';
import { error, normalizeResourcePath } from './utils';

export default {
	async fetch(request, env, ctx) {
		const normalizedPath = normalizeResourcePath(new URL(request.url).pathname);

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

		if (request.method !== 'GET') {
			const authError = requireAuth(request, env);
			if (authError) return addCors(authError);
		}

		try {
			let response: Response;
			if (normalizedPath.startsWith('/routes')) {
				response = await handleRoutesEndpoint(request, env, normalizedPath);
			} else if (normalizedPath.startsWith('/maps')) {
				response = await handleMapsEndpoint(request, env, normalizedPath, ctx);
			} else if (
				normalizedPath.startsWith('/assets/') ||
				normalizedPath.startsWith('/images/')
			) {
				response = await handleAssetRequest(request, env, normalizedPath);
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
