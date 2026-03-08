'use server';

import { cookies } from 'next/headers';

export async function saveAuthToken(token: string) {
	const cookieStore = await cookies();
	cookieStore.set('AUTH_TOKEN', token, {
		maxAge: 60 * 60 * 24 * 7,
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
	});
}
