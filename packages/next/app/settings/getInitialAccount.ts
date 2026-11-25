import { cookies } from 'next/headers';

export type InitialAccount = { email: string; admin: boolean };

export async function getInitialAccount(): Promise<InitialAccount | null> {
	const token = (await cookies()).get('AUTH_TOKEN')?.value;
	if (!token) return null;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_ROUTE_URL}/auth`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		if (!response.ok) return null;
		return (await response.json()) as InitialAccount;
	} catch {
		return null;
	}
}
