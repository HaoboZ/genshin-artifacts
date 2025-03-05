import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { nanoid } from 'nanoid';
import webpush from 'web-push';
import 'dotenv/config';

webpush.setVapidDetails(
	'mailto:haobozhang9081@gmail.com',
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY,
);

const app = express();

app.use(cors());
app.use(bodyParser.json());

const subscriptions = new Map();
const scheduledNotifications = new Map();

// Endpoint to save subscription
app.post('/subscribe', (req, res) => {
	const { subscription } = req.body;
	const id = nanoid();
	console.log('subscribe', id);
	subscriptions.set(id, subscription);
	res.status(201).json({ success: true });
});

// Endpoint to schedule a notification
app.post('/send', (req, res) => {
	const { subscription, data } = req.body;
	console.log('send', data.title, data.delay);
	if (!subscription || !data) {
		res.status(400).json({ error: 'Missing required parameters' });
		return;
	}

	const notificationId = nanoid();

	// Schedule the notification
	const timeoutId = setTimeout(async () => {
		try {
			await webpush.sendNotification(subscription, JSON.stringify(data));
			scheduledNotifications.delete(notificationId);
		} catch (error) {
			console.error('Error sending push notification:', error);
		}
	}, data.delay);

	scheduledNotifications.set(notificationId, { timeoutId, subscription });

	res.status(200).json({ success: true, id: notificationId });
});

// Endpoint to cancel a notification
app.post('/cancel', (req, res) => {
	const { id } = req.body;
	console.log('cancel', id);
	if (!id || !scheduledNotifications.has(id)) {
		res.status(400).json({ error: 'Missing required parameters' });
		return;
	}

	// Cancel specific notification
	clearTimeout(scheduledNotifications.get(id).timeoutId);
	scheduledNotifications.delete(id);
	res.status(200).json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
