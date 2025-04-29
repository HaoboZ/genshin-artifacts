import AsyncButton from '@/components/loaders/asyncButton';
import { Stack, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Fragment, useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { cancelNotification, sendNotification } from './notificationActions';

export default function RespawnNotification({
	storageKey,
	item,
	icon,
	delay,
}: {
	storageKey: string;
	item: string;
	icon?: string;
	delay?: number;
}) {
	const [time, setTime] = useState(() => new Date());

	const [respawn, setRespawn] = useLocalStorage<{ id: string; time: number }>(storageKey);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
			<AsyncButton
				variant='contained'
				onClick={async () => {
					const time = +new Date() + delay;
					const id = await sendNotification(OneSignal.User.onesignalId, {
						title: `${item} Respawned`,
						icon,
						time: new Date(time).toUTCString(),
					});

					if (respawn?.id) await cancelNotification(respawn.id);
					setRespawn({ id, time });
				}}>
				{item} Notification
			</AsyncButton>
			{respawn && +time < respawn.time && (
				<Fragment>
					<AsyncButton
						variant='contained'
						color='error'
						onClick={async () => {
							await cancelNotification(respawn.id);
							setRespawn(null);
						}}>
						Cancel
					</AsyncButton>
					<Typography>Respawn Time: {new Date(respawn.time).toLocaleString()}</Typography>
				</Fragment>
			)}
		</Stack>
	);
}
