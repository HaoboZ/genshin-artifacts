import AsyncButton from '@/components/loaders/asyncButton';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { sendNotification } from './actions';
import { useNotifications } from './index';

export default function NotificationButton({
	children,
	title,
	icon,
	body,
	delay,
	onComplete,
}: {
	children: ReactNode;
	title: string;
	icon: string;
	body?: string;
	delay: number;
	onComplete?: (id: string, delay: number) => void;
}) {
	const { subscription, subscribe } = useNotifications();

	const [isSupported, setIsSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>(null);

	useEffect(() => {
		if (!('serviceWorker' in navigator && 'Notification' in window)) return;
		setIsSupported(true);
		setPermission(Notification.permission);
	}, []);

	if (!isSupported) return null;

	return (
		<AsyncButton
			variant='contained'
			disabled={!isSupported}
			onClick={async () => {
				await subscribe();
				if (permission !== 'granted') {
					const result = await Notification.requestPermission();
					setPermission(result);
				}

				const id = await sendNotification(subscription.toJSON(), { title, icon, body, delay });

				await new Promise((resolve) => setTimeout(resolve, 500));
				onComplete?.(id, delay);
			}}>
			{isSupported ? children : 'Not Supported'}
		</AsyncButton>
	);
}
