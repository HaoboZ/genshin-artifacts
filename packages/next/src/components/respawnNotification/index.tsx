import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import OneSignal from 'react-onesignal';
import { useIntervalWhen, useLocalstorageState } from 'rooks';
import AsyncButton from '../loaders/asyncButton';
import { cancelNotification, sendNotification } from './notificationActions';

export default function RespawnNotification({
	storageKey,
	item,
	icon,
	notificationTime,
}: {
	storageKey: string;
	item: string;
	icon?: string;
	notificationTime?: () => Date;
}) {
	const [time, setTime] = useState(() => new Date());
	const [respawn, setRespawn] = useLocalstorageState<{ id: string; time: number }>(storageKey);

	useIntervalWhen(() => setTime(new Date()), 1000);

	const hasTime = respawn && +time < respawn.time;

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				<AsyncButton
					variant='contained'
					size='small'
					onClick={async () => {
						const date = notificationTime();
						const id = await sendNotification(OneSignal.User.onesignalId, {
							title: `${item} Respawned`,
							icon,
							time: date.toUTCString(),
						});

						if (respawn?.id) await cancelNotification(respawn.id);
						setRespawn({ id, time: +date });
					}}>
					{item} Notification
				</AsyncButton>
				{hasTime && (
					<AsyncButton
						variant='contained'
						color='error'
						onClick={async () => {
							await cancelNotification(respawn.id);
							setRespawn(null);
						}}>
						Cancel
					</AsyncButton>
				)}
			</Stack>
			{hasTime && (
				<Typography>Respawn Time: {new Date(respawn.time).toLocaleString()}</Typography>
			)}
		</Stack>
	);
}
