'use client';

import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import {
	getReminderSchedules,
	importReminderSchedule,
	type ReminderSchedule,
} from '@/components/respawnNotification/notificationActions';
import reportError from '@/helpers/reportError';

const RespawnNotification = dynamic(() => import('@/components/respawnNotification'), {
	ssr: false,
});

const timers = [
	{
		storageKey: 'artifact-respawn',
		item: 'Artifacts Farming',
		icon: '/icons/essence.png',
		hours: 24,
	},
	{
		storageKey: 'specialties-respawn',
		item: 'Specialties Farming',
		icon: '/icons/materials.png',
		hours: 48,
	},
	{
		storageKey: 'crystals-respawn',
		item: 'Crystals Farming',
		icon: '/icons/crystal.png',
		hours: 72,
	},
	{
		storageKey: 'parametric-transformer',
		item: 'Parametric Transformer',
		icon: '/icons/materials.png',
		hours: 166,
	},
];

export default function Notifications() {
	const { enqueueSnackbar } = useSnackbar();

	const [schedules, setSchedules] = useState<Record<string, ReminderSchedule>>({});

	const refreshSchedules = useCallback(async () => {
		try {
			const { authenticated, schedules: remoteSchedules } = await getReminderSchedules();
			const schedules = new Map(remoteSchedules.map((reminder) => [reminder.key, reminder]));
			if (authenticated) {
				for (const timer of timers) {
					if (schedules.has(timer.storageKey)) continue;
					try {
						const legacy = JSON.parse(localStorage.getItem(timer.storageKey) ?? 'null');
						if (
							typeof legacy?.id === 'string' &&
							typeof legacy?.time === 'number' &&
							legacy.time > Date.now()
						) {
							const reminder = { key: timer.storageKey, id: legacy.id, time: legacy.time };
							await importReminderSchedule(reminder);
							schedules.set(reminder.key, reminder);
						}
					} catch (error) {
						console.warn('Could not sync a saved local reminder', error);
					}
				}
			}
			setSchedules(Object.fromEntries(schedules));
		} catch (error) {
			reportError(error, enqueueSnackbar);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		void refreshSchedules();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
			<Stack sx={{ gap: 2 }}>
				<Stack sx={{ flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
					<Box
						sx={{
							display: 'grid',
							placeItems: 'center',
							width: 42,
							height: 42,
							borderRadius: 2,
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
						}}>
						<NotificationsActiveOutlinedIcon />
					</Box>
					<Typography variant='h6'>Respawn reminders</Typography>
				</Stack>
				<Box className='onesignal-customlink-container' sx={{ minHeight: '0 !important' }} />
				<Stack spacing={1}>
					{timers.map((timer) => (
						<RespawnNotification
							key={timer.storageKey}
							{...timer}
							reminder={schedules[timer.storageKey]}
							onReminderChange={async () => {
								await refreshSchedules();
							}}
						/>
					))}
				</Stack>
			</Stack>
		</Paper>
	);
}
