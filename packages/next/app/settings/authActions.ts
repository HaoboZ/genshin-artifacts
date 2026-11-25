'use server';

import { cookies } from 'next/headers';

export async function saveAuthToken(token: string | null) {
	const cookieStore = await cookies();
	if (!token) {
		cookieStore.delete('AUTH_TOKEN');
		return;
	}
	cookieStore.set('AUTH_TOKEN', token, {
		maxAge: 60 * 60,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	});
}
