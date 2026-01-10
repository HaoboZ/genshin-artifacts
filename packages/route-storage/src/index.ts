import { requireAuth } from './auth';
import handleDelete from './handlers/delete';
import handleGet from './handlers/get';
import handlePost from './handlers/post';
import { handlePut } from './handlers/put';
import { error } from './utils';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const method = request.method;

		if (method === 'OPTIONS') {
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

			switch (request.method) {
				case 'GET':
					response = await handleGet(request, env, pathname);
					break;
				case 'POST':
					response = await handlePost(request, env, pathname);
					break;
				case 'PUT':
					response = await handlePut(request, env, pathname, ctx);
					break;
				case 'DELETE':
					response = await handleDelete(request, env, pathname, ctx);
					break;
				default:
					response = error('Method Not Allowed', 405);
			}

			return addCors(response);
		} catch (error) {
			if (error instanceof Response) return error;
			console.error('ERROR:', error);
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
