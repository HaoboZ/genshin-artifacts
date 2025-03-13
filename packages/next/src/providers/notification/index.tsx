'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext<{
	subscription: PushSubscription;
	subscribe: () => Promise<void>;
	unsubscribe: () => Promise<void>;
}>({
	subscription: null,
	subscribe: () => null,
	unsubscribe: () => null,
});
NotificationContext.displayName = 'Notification';

export default function NotificationProvider({ children }: { children: ReactNode }) {
	const [subscription, setSubscription] = useState<PushSubscription>(null);

	useEffect(() => {
		if (!('serviceWorker' in navigator && 'PushManager' in window)) return;
		// Register service worker
		(async () => {
			const registration = await navigator.serviceWorker.register('/sw.js');
			const sub = await registration.pushManager.getSubscription();
			setSubscription(sub);
		})();
	}, []);

	return (
		<NotificationContext.Provider
			value={{
				subscription,
				subscribe: async () => {
					if (subscription) return;

					const registration = await navigator.serviceWorker.ready;
					const sub = await registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
					});
					setSubscription(sub);
				},
				unsubscribe: async () => {
					await subscription?.unsubscribe();
					setSubscription(null);
				},
			}}>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	return useContext(NotificationContext);
}
