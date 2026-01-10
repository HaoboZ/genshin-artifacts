'use server';

import axios from 'axios';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

export async function createRoute(name: string, owner: string) {
	const cookieStore = await cookies();

	const id = nanoid();
	await axios.post(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${id}.json`,
		{ id, name, owner, maps: [] },
		{ headers: { Authorization: `Bearer ${cookieStore.get('AUTH_TOKEN').value}` } },
	);
	return id;
}
