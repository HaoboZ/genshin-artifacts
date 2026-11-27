'use client';

import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { useIntervalWhen } from 'rooks';

import AsyncButton from '@/components/loaders/asyncButton';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';

import { type ReminderSchedule, scheduleReminder } from './notificationActions';

const CustomRespawnModal = dynamicModal(() => import('./customRespawnModal'));

export default function RespawnNotification({
	storageKey,
	item,
	icon,
	hours,
	reminder,
	onReminderChange,
}: {
	storageKey: string;
	item: string;
	icon?: string;
	hours: number;
	reminder?: ReminderSchedule;
	onReminderChange: (reminder: ReminderSchedule) => void | Promise<void>;
}) {
	const [now, setNow] = useState(() => new Date());
	const { showModal } = useModal();

	useIntervalWhen(() => setNow(new Date()), 1000);

	const isScheduled = !!reminder && reminder.time > +now;
	const scheduledDate = isScheduled ? new Date(reminder.time) : undefined;

	const setReminder = async (date: Date) => {
		const schedule = await scheduleReminder(storageKey, {
			title: `${item} Respawned`,
			icon,
			time: +date,
		});
		await onReminderChange(schedule);
	};

	return (
		<Card variant='outlined' sx={{ bgcolor: 'background.default' }}>
			<CardContent>
				<Grid container spacing={1} sx={{ alignItems: 'center' }}>
					<Grid size={2}>
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: 1.5,
								display: 'grid',
								placeItems: 'center',
								bgcolor: 'action.hover',
							}}>
							{icon ? (
								<Box component='img' src={icon} alt={item} sx={{ width: 28, height: 28 }} />
							) : (
								<NotificationsActiveOutlinedIcon color='action' />
							)}
						</Box>
					</Grid>
					<Grid size={10}>
						<Typography variant='subtitle2'>{item}</Typography>
						<Typography
							variant='caption'
							color={isScheduled ? 'success.main' : 'text.secondary'}>
							{isScheduled
								? `Reminder set: ${scheduledDate?.toLocaleString()}`
								: 'No reminder scheduled'}
						</Typography>
					</Grid>
					<Grid size={6}>
						<AsyncButton
							fullWidth
							variant={isScheduled ? 'outlined' : 'contained'}
							size='small'
							onClick={async () => {
								const date = new Date();
								date.setHours(date.getHours() + hours);
								await setReminder(date);
							}}>
							{isScheduled ? 'Reset' : 'Start'}
						</AsyncButton>
					</Grid>
					<Grid size={6}>
						<Button
							fullWidth
							variant='outlined'
							size='small'
							onClick={() => {
								showModal(CustomRespawnModal, {
									props: { item, hours, onSetReminder: setReminder },
								});
							}}>
							Custom
						</Button>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
