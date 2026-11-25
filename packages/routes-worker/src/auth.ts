import { createRemoteJWKSet, jwtVerify } from 'jose';

import { error } from './utils';

export type AuthUser = { email: string; admin: boolean };
const firebaseKeys = createRemoteJWKSet(
	new URL(
		'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
	),
);

export async function authenticate(request: Request, env: Env): Promise<AuthUser | null> {
	const authorization = request.headers.get('Authorization');
	if (!authorization?.startsWith('Bearer ')) return null;
	const token = authorization.slice(7);
	if (!token) return null;

	let payload;
	try {
		({ payload } = await jwtVerify(token, firebaseKeys, {
			issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
			audience: env.FIREBASE_PROJECT_ID,
		}));
	} catch {
		return null;
	}
	if (
		typeof payload.sub !== 'string' ||
		typeof payload.email !== 'string' ||
		payload.email_verified !== true
	)
		return null;

	const email = payload.email.toLowerCase();
	await env.DB.prepare(
		`INSERT INTO users (id, email, admin) VALUES (?, ?, 0)
		 ON CONFLICT(email) DO UPDATE SET id = excluded.id
		 ON CONFLICT(id) DO UPDATE SET email = excluded.email`,
	)
		.bind(payload.sub, email)
		.run();
	const user = await env.DB.prepare('SELECT admin FROM users WHERE id = ?')
		.bind(payload.sub)
		.first<{ admin: number }>();
	return { email, admin: user?.admin === 1 };
}

export async function requireAuth(request: Request, env: Env): Promise<AuthUser | Response> {
	try {
		const user = await authenticate(request, env);
		return user ?? error('Unauthorized', 401);
	} catch (cause) {
		console.error('Authentication failed', cause);
		return error('Unauthorized', 401);
	}
}
