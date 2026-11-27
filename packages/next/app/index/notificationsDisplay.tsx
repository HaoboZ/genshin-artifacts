'use client';

import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import RespawnNotification from '@/components/respawnNotification';
import type { ReminderSchedule } from '@/components/respawnNotification/notificationActions';

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

export default function NotificationsDisplay({
	initialSchedules,
}: {
	initialSchedules: Record<string, ReminderSchedule>;
}) {
	const router = useRouter();

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
							reminder={initialSchedules[timer.storageKey]}
							onReminderChange={router.refresh}
						/>
					))}
				</Stack>
			</Stack>
		</Paper>
	);
}
