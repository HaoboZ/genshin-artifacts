'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

import { type RouteData } from './types';

async function authHeaders() {
	const token = (await cookies()).get('AUTH_TOKEN')?.value;
	if (!token) throw new Error('Sign in with Google to manage routes.');
	return { Authorization: `Bearer ${token}` };
}

export async function upsertRoute(routeData: RouteData) {
	const headers = await authHeaders();

	if (routeData.id) {
		await axios.post(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${routeData.id}`, routeData, {
			headers,
		});
		return routeData.id;
	}

	const { data } = await axios.post<RouteData>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes`,
		routeData,
		{ headers },
	);
	return data.id;
}

export async function deleteRoute(id: string) {
	await axios.delete(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${id}`, {
		headers: await authHeaders(),
	});
}

export async function clearCache() {
	await axios.post(`${process.env.NEXT_PUBLIC_ROUTE_URL}/cache/clear`, null, {
		headers: await authHeaders(),
	});
}
