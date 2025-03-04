self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

let timeoutId;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
	if (event.data?.type !== 'SCHEDULE_NOTIFICATION') return;
	const { title, badge, body, icon, delay } = event.data;

	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		self.registration.showNotification(title, { badge, body, icon, requireInteraction: true });
	}, delay);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			// If a window is already open, focus it
			for (const client of clientList) {
				if (client.url === '/' && 'focus' in client) {
					return client.focus();
				}
			}
			// Otherwise open a new window
			if (self.clients.openWindow) {
				return self.clients.openWindow('/');
			}
		}),
	);
});
