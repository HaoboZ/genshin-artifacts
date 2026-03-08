'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { type MapData } from '../routes/types';

export async function upsertMap(mapData: MapData) {
	const cookieStore = await cookies();
	const token = cookieStore.get('AUTH_TOKEN')?.value;
	const headers = { Authorization: `Bearer ${token}` };

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
	const cookieStore = await cookies();
	await axios.put(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, file, {
		headers: {
			Authorization: `Bearer ${cookieStore.get('AUTH_TOKEN').value}`,
			...(file instanceof File ? { 'Content-Type': file.type } : {}),
		},
	});
}

export async function deleteMap(id: string) {
	const cookieStore = await cookies();
	await axios.delete(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, {
		headers: { Authorization: `Bearer ${cookieStore.get('AUTH_TOKEN').value}` },
	});
}
