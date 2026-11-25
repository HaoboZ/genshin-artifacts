import type { AuthUser } from '../auth';
import { error, json } from '../utils';

const REMINDER_KEYS = new Set([
	'artifact-respawn',
	'specialties-respawn',
	'crystals-respawn',
	'parametric-transformer',
]);

type ReminderRow = {
	key: string;
	notification_id: string;
	scheduled_at: number;
};

export async function handleNotificationsEndpoint(
	request: Request,
	env: Env,
	pathname: string,
	user: AuthUser | null,
) {
	if (!user) return error('Unauthorized', 401);
	if (pathname === '/notifications') {
		if (request.method !== 'GET') return error('Method Not Allowed', 405);
		const result = await env.DB.prepare(
			'SELECT key, notification_id, scheduled_at FROM notification_reminders WHERE user_id = ? ORDER BY key',
		)
			.bind(user.id)
			.all<ReminderRow>();
		return json(
			result.results.map(({ key, notification_id, scheduled_at }) => ({
				key,
				id: notification_id,
				time: scheduled_at,
			})),
		);
	}

	const key = decodeURIComponent(pathname.slice('/notifications/'.length));
	if (!REMINDER_KEYS.has(key)) return error('Unknown reminder', 404);

	if (request.method === 'PUT') {
		let body: { id?: unknown; time?: unknown };
		try {
			body = (await request.json()) as typeof body;
		} catch {
			return error('Invalid JSON body');
		}
		if (
			typeof body.id !== 'string' ||
			!body.id ||
			typeof body.time !== 'number' ||
			!Number.isFinite(body.time)
		) {
			return error('Reminder requires a notification ID and scheduled time');
		}
		await env.DB.prepare(
			`INSERT INTO notification_reminders (user_id, key, notification_id, scheduled_at)
			 VALUES (?, ?, ?, ?)
			 ON CONFLICT(user_id, key) DO UPDATE SET
				notification_id = excluded.notification_id,
				scheduled_at = excluded.scheduled_at,
				updated_at = CURRENT_TIMESTAMP`,
		)
			.bind(user.id, key, body.id, body.time)
			.run();
		return json({ key, id: body.id, time: body.time });
	}

	if (request.method === 'DELETE') {
		await env.DB.prepare('DELETE FROM notification_reminders WHERE user_id = ? AND key = ?')
			.bind(user.id, key)
			.run();
		return json({ success: true });
	}

	return error('Method Not Allowed', 405);
}
