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

const scheduledNotifications = new Map();

app.all('/ping', (req, res) => {
	res.status(200).json({ pong: true });
});

app.post('/send', (req, res) => {
	const { subscription, data } = req.body;
	if (!subscription || !data) {
		res.status(400).json({ error: 'Missing required parameters' });
		return;
	}

	const notificationId = nanoid();
	console.log('send', notificationId, data.title, data.delay);

	// Schedule the notification
	const timeoutId = setTimeout(async () => {
		try {
			const sendResult = await webpush.sendNotification(subscription, JSON.stringify(data));
			console.log('sent', notificationId, sendResult.statusCode);
			scheduledNotifications.delete(notificationId);
		} catch (error) {
			console.error('Error sending push notification:', error);
		}
	}, data.delay);

	scheduledNotifications.set(notificationId, { timeoutId, subscription });

	res.status(200).json({ success: true, id: notificationId });
});

app.post('/cancel', (req, res) => {
	const { id } = req.body;
	if (!id) {
		res.status(400).json({ error: 'Missing required parameters' });
		return;
	}

	if (scheduledNotifications.has(id)) {
		// Cancel specific notification
		console.log('cancel', id);
		clearTimeout(scheduledNotifications.get(id).timeoutId);
		scheduledNotifications.delete(id);
	}
	res.status(200).json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
