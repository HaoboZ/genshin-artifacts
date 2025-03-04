import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import AsyncButton from './loaders/asyncButton';

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
	onComplete?: (delay: number) => void;
}) {
	const [isSupported, setIsSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');

	useEffect(() => {
		if (!('serviceWorker' in navigator && 'Notification' in window)) return;
		setIsSupported(true);
		setPermission(Notification.permission);
	}, []);

	const requestPermission = async () => {
		try {
			const result = await Notification.requestPermission();
			setPermission(result);
		} catch (error) {
			console.error('Error requesting notification permission:', error);
		}
	};

	if (!isSupported) return null;

	return (
		<AsyncButton
			variant='contained'
			disabled={!isSupported}
			onClick={async () => {
				if (permission !== 'granted') await requestPermission();

				navigator.serviceWorker.controller?.postMessage({
					type: 'SCHEDULE_NOTIFICATION',
					title,
					icon,
					body,
					delay,
				});

				await new Promise((resolve) => setTimeout(resolve, 500));
				onComplete?.(delay);
			}}>
			{isSupported ? children : 'Not Supported'}
		</AsyncButton>
	);
}
