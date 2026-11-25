'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

import { type MapData } from '../routes/types';

async function authHeaders() {
	const token = (await cookies()).get('AUTH_TOKEN')?.value;
	if (!token) throw new Error('Sign in with Google to manage maps.');
	return { Authorization: `Bearer ${token}` };
}

export async function upsertMap(mapData: MapData) {
	const headers = await authHeaders();

	if (mapData.id) {
		await axios.post(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}`, mapData, {
			headers,
		});
		return mapData.id;
	}

	const { data } = await axios.post<MapData>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps`,
		mapData,
		{ headers },
	);
	return data.id;
}

export async function addFile(id: string, file: File | FormData) {
	await axios.put(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, file, {
		headers: {
			...(await authHeaders()),
			...(file instanceof File ? { 'Content-Type': file.type } : {}),
		},
	});
}

export async function deleteMap(id: string) {
	await axios.delete(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, {
		headers: await authHeaders(),
	});
}
