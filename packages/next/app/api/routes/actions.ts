'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { type RouteData } from './types';

export async function upsertRoute(routeData: RouteData) {
	const cookieStore = await cookies();
	const token = cookieStore.get('AUTH_TOKEN')?.value;
	const headers = { Authorization: `Bearer ${token}` };

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
	const cookieStore = await cookies();
	await axios.delete(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${id}`, {
		headers: { Authorization: `Bearer ${cookieStore.get('AUTH_TOKEN').value}` },
	});
}
