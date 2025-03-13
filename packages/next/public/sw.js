self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
	console.log('received');
	if (!event.data) return;
	const data = event.data.json();
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: data.icon,
			requireInteraction: true,
		}),
	);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			// If a window is already open, focus it
			for (const client of clientList) {
				if (client.url === 'https://genshin-artifacts.vercel.app' && 'focus' in client) {
					return client.focus();
				}
			}
			// Otherwise open a new window
			if (self.clients.openWindow) {
				return self.clients.openWindow('https://genshin-artifacts.vercel.app');
			}
		}),
	);
});
