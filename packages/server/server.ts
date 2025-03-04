import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import webpush from 'web-push';

const vapidKeys = {
	publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	privateKey: process.env.VAPID_PRIVATE_KEY,
};

// Configure web-push with VAPID details
webpush.setVapidDetails(
	'mailto:example@example.com', // Replace with your email
	vapidKeys.publicKey,
	vapidKeys.privateKey,
);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for subscriptions and scheduled notifications
// In a production app, you would use a database
const subscriptions = new Map();
const scheduledNotifications = new Map();

// Endpoint to save subscription
app.post('/api/subscribe', (req, res) => {
	const subscription = req.body.subscription;
	const id = Date.now().toString();

	subscriptions.set(id, subscription);

	res.status(201).json({ success: true, id });
});

// Endpoint to schedule a notification
app.post('/api/schedule-notification', (req, res) => {
	const { subscription, delay, message } = req.body;

	if (!subscription || !delay) {
		return res.status(400).json({ error: 'Missing required parameters' });
	}

	const notificationId = Date.now().toString();

	// Schedule the notification
	const timeoutId = setTimeout(async () => {
		try {
			await webpush.sendNotification(
				subscription,
				JSON.stringify({
					title: 'Scheduled Notification',
					body: message || 'Your scheduled notification is here!',
					icon: '/icon-192x192.png',
				}),
			);

			// Remove from scheduled notifications after sending
			scheduledNotifications.delete(notificationId);
		} catch (error) {
			console.error('Error sending push notification:', error);
		}
	}, delay);

	// Store the timeout ID so we can cancel it if needed
	scheduledNotifications.set(notificationId, {
		timeoutId,
		subscription,
	});

	res.status(200).json({
		success: true,
		message: 'Notification scheduled',
		id: notificationId,
		scheduledFor: new Date(Date.now() + delay).toISOString(),
	});
});

// Endpoint to cancel a notification
app.post('/api/cancel-notification', (req, res) => {
	const { id } = req.body;

	if (id && scheduledNotifications.has(id)) {
		// Cancel specific notification
		clearTimeout(scheduledNotifications.get(id).timeoutId);
		scheduledNotifications.delete(id);
		res.status(200).json({ success: true, message: 'Notification cancelled' });
	} else {
		// Cancel all notifications
		for (const [id, { timeoutId }] of scheduledNotifications.entries()) {
			clearTimeout(timeoutId);
			scheduledNotifications.delete(id);
		}
		res.status(200).json({ success: true, message: 'All notifications cancelled' });
	}
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
