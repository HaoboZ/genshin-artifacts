'use server';
import axios from 'axios';

export async function subscribeUser(sub: PushSubscription) {
	await axios.post(`${process.env.NOTIFICATION_SERVER}/subscribe`, sub);
	return { success: true };
}

export async function unsubscribeUser() {
	await axios.post(`${process.env.NOTIFICATION_SERVER}/unsubscribe`);
	return { success: true };
}

export async function sendNotification(
	subscription: PushSubscription,
	data: {
		title: string;
		body?: string;
		icon?: string;
		delay?: number;
	},
) {
	if (!subscription) throw new Error('No subscription available');

	const res = await axios.post(`${process.env.NOTIFICATION_SERVER}/send`, {
		subscription,
		data,
	});
	return res.data.id as string;
}

export async function cancelNotification(subscription: PushSubscription, id: string) {
	if (!subscription) throw new Error('No subscription available');

	await axios.post(`${process.env.NOTIFICATION_SERVER}/cancel`, { subscription, id });
}
