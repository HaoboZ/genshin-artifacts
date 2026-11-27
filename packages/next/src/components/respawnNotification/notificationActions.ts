'use server';

import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type ReminderSchedule = { key: string; id: string; time: number };

async function getAuth() {
	const token = (await cookies()).get('AUTH_TOKEN')?.value;
	const routeUrl = process.env.NEXT_PUBLIC_ROUTE_URL?.replace(/\/+$/, '');
	if (!token) throw new Error('Sign in with Google to sync reminders across your devices.');
	if (!routeUrl) throw new Error('NEXT_PUBLIC_ROUTE_URL is not configured.');
	return { token, routeUrl, headers: { Authorization: `Bearer ${token}` } };
}

async function getExistingSchedules(routeUrl: string, headers: { Authorization: string }) {
	const { data } = await axios.get<ReminderSchedule[]>(`${routeUrl}/notifications`, { headers });
	return data;
}

export async function scheduleReminder(
	key: string,
	data: { title: string; icon?: string; time: number },
) {
	const { routeUrl, headers } = await getAuth();
	const [{ data: user }, existingSchedules] = await Promise.all([
		axios.get<{ id: string }>(`${routeUrl}/auth`, { headers }),
		getExistingSchedules(routeUrl, headers),
	]);
	const previous = existingSchedules.find((reminder) => reminder.key === key);
	const { data: notification } = await axios.post(
		'https://api.onesignal.com/notifications',
		{
			app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
			contents: { en: data.title },
			include_aliases: { external_id: [user.id] },
			target_channel: 'push',
			chrome_web_icon: data.icon && `${process.env.NEXT_PUBLIC_VERCEL_URL}${data.icon}`,
			send_after: new Date(data.time).toUTCString(),
		},
		{
			params: { c: 'push' },
			headers: {
				'Authorization': `Key ${process.env.ONESIGNAL_API_KEY}`,
				'accept': 'application/json',
				'content-type': 'application/json',
			},
		},
	);

	try {
		await axios.put(
			`${routeUrl}/notifications/${encodeURIComponent(key)}`,
			{ id: notification.id, time: data.time },
			{ headers },
		);
	} catch (error) {
		await cancelNotification(notification.id);
		throw error;
	}

	if (previous?.id) await cancelNotification(previous.id);
	revalidatePath('/');
	return { key, id: notification.id as string, time: data.time } satisfies ReminderSchedule;
}

export async function cancelReminder(key: string) {
	const { routeUrl, headers } = await getAuth();
	const existingSchedules = await getExistingSchedules(routeUrl, headers);
	const previous = existingSchedules.find((reminder) => reminder.key === key);
	await axios.delete(`${routeUrl}/notifications/${encodeURIComponent(key)}`, { headers });
	if (previous?.id) await cancelNotification(previous.id);
	revalidatePath('/');
}

async function cancelNotification(id: string) {
	try {
		await axios.delete(`https://api.onesignal.com/notifications/${id}`, {
			params: { app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID },
			headers: { Authorization: `Key ${process.env.ONESIGNAL_API_KEY}` },
		});
	} catch (error) {
		console.error('Could not cancel old OneSignal reminder', error);
	}
}
