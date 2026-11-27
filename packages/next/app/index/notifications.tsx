import { cookies } from 'next/headers';

import type { ReminderSchedule } from '@/components/respawnNotification/notificationActions';

import NotificationsDisplay from './notificationsDisplay';

export default async function Notifications() {
	let schedules: Record<string, ReminderSchedule> = {};

	const token = (await cookies()).get('AUTH_TOKEN')?.value;
	if (token) {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_ROUTE_URL}/notifications`, {
				headers: { Authorization: `Bearer ${token}` },
				cache: 'no-store',
			});
			if (response.ok) {
				const reminders = (await response.json()) as ReminderSchedule[];
				schedules = Object.fromEntries(reminders.map((reminder) => [reminder.key, reminder]));
			}
		} catch {}
	}

	return <NotificationsDisplay initialSchedules={schedules} />;
}
