import { error } from './utils';

export function authenticate(request: Request, env: Env) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader) return false;

	const [type, token] = authHeader.split(' ');
	if (type !== 'Bearer') return false;
	return token === env.AUTH_TOKEN;
}

export function requireAuth(request: Request, env: Env) {
	if (!authenticate(request, env)) {
		return error('Unauthorized', 401);
	}
}
