import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import OneSignal from 'react-onesignal';
import { useIntervalWhen, useLocalstorageState } from 'rooks';

import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';

import { cancelNotification, sendNotification } from './notificationActions';

const CustomRespawnModal = dynamicModal(() => import('./customRespawnModal'));

export default function RespawnNotification({
	storageKey,
	item,
	icon,
	hours,
}: {
	storageKey: string;
	item: string;
	icon?: string;
	hours: number;
}) {
	const [now, setNow] = useState(() => new Date());
	const [respawn, setRespawn] = useLocalstorageState<{ id: string; time: number }>(storageKey);
	const { showModal } = useModal();

	useIntervalWhen(() => setNow(new Date()), 1000);

	const isScheduled = !!respawn && respawn.time > +now;
	const scheduledDate = isScheduled ? new Date(respawn.time) : undefined;

	const setReminder = async (date: Date) => {
		const id = await sendNotification(OneSignal.User.onesignalId, {
			title: `${item} Respawned`,
			icon,
			time: date.toUTCString(),
		});
		if (respawn?.id) await cancelNotification(respawn.id);
		setRespawn({ id, time: +date });
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
						<Button
							fullWidth
							variant='contained'
							size='small'
							onClick={() => {
								const date = new Date();
								date.setHours(date.getHours() + hours);
								void setReminder(date);
							}}>
							Start
						</Button>
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
