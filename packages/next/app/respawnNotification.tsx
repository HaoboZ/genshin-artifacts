import AsyncButton from '@/components/loaders/asyncButton';
import { useNotifications } from '@/src/providers/notification';
import { cancelNotification } from '@/src/providers/notification/actions';
import NotificationButton from '@/src/providers/notification/button';
import { Stack, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Fragment } from 'react';

export default function RespawnNotification({
	storageKey,
	item,
	icon,
	delay,
}: {
	storageKey: string;
	item: string;
	icon: string;
	delay: number;
}) {
	const { subscription } = useNotifications();

	const [respawn, setRespawn] = useLocalStorage<{ id: string; time: number }>(storageKey);

	return (
		<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
			<NotificationButton
				title={`${item} Respawned`}
				icon={icon}
				delay={delay * 60 * 1000}
				onComplete={async (id, delay) => {
					if (respawn?.id) await cancelNotification(subscription.toJSON(), respawn.id);
					setRespawn({ id, time: +new Date() + delay });
				}}>
				{item} Farming Notification
			</NotificationButton>
			{respawn && +new Date() < respawn.time && (
				<Fragment>
					<AsyncButton
						variant='contained'
						color='error'
						onClick={async () => {
							await cancelNotification(subscription.toJSON(), respawn.id);
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
