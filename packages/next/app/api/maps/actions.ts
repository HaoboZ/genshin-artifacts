'use server';

import axios from 'axios';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

export async function createMap(name: string, owner: string, notes: string) {
	const cookieStore = await cookies();

	const id = nanoid();
	await axios.post(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`,
		{ id, name, owner, notes, points: [] },
		{ headers: { Authorization: `Bearer ${cookieStore.get('AUTH_TOKEN').value}` } },
	);
	return id;
}
