'use server';
import { nanoid } from 'nanoid';
import webpush from 'web-push';

webpush.setVapidDetails(
	'mailto:haobozhang9081@gmail.com',
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY,
);

const scheduledNotifications = new Map();

export async function sendNotification(
	subscription: PushSubscriptionJSON,
	data: {
		title: string;
		body?: string;
		icon?: string;
		delay?: number;
	},
) {
	if (!subscription) throw new Error('No subscription available');

	const notificationId = nanoid();
	console.log('send', notificationId, data.title, data.delay);

	// Schedule the notification
	const timeoutId = setTimeout(async () => {
		try {
			const sendResult = await webpush.sendNotification(
				subscription as any,
				JSON.stringify(data),
			);
			console.log('sent', notificationId, sendResult.statusCode);
			scheduledNotifications.delete(notificationId);
		} catch (error) {
			console.error('Error sending push notification:', error);
		}
	}, data.delay);

	scheduledNotifications.set(notificationId, { timeoutId, subscription });
	return notificationId;
	// const res = await axios.post(`${process.env.NOTIFICATION_SERVER}/send`, {
	// 	subscription,
	// 	data,
	// });
	// return res.data.id as string;
}

export async function cancelNotification(subscription: PushSubscriptionJSON, id: string) {
	if (!subscription) throw new Error('No subscription available');
	if (scheduledNotifications.has(id)) {
		// Cancel specific notification
		console.log('cancel', id);
		clearTimeout(scheduledNotifications.get(id).timeoutId);
		scheduledNotifications.delete(id);
	}
	// await axios.post(`${process.env.NOTIFICATION_SERVER}/cancel`, { subscription, id });
}
