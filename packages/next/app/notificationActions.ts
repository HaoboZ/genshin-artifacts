'use server';
import axios from 'axios';

export async function sendNotification(
	user: string,
	data: {
		title: string;
		icon?: string;
		time?: string;
	},
) {
	if (!user) throw new Error('No user available');

	const res = await axios.post(
		'https://api.onesignal.com/notifications',
		{
			app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
			contents: { en: data.title },
			include_aliases: { onesignal_id: [user] },
			target_channel: 'push',
			chrome_web_icon: data.icon && process.env.NEXT_PUBLIC_VERCEL_URL + data.icon,
			send_after: data.time,
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
	return res.data.id as string;
}

export async function cancelNotification(id: string) {
	try {
		await axios.delete(`https://api.onesignal.com/notifications/${id}`, {
			params: { app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID },
			headers: { Authorization: `Key ${process.env.ONESIGNAL_API_KEY}` },
		});
	} catch (e) {
		console.error(e);
	}
}
