import AsyncButton from '@/components/loaders/asyncButton';
import { useNotifications } from '@/src/providers/notification';
import { cancelNotification } from '@/src/providers/notification/actions';
import NotificationButton from '@/src/providers/notification/button';
import { Stack, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Fragment } from 'react';

export default function RespawnNotification() {
	const { subscription } = useNotifications();

	const [artifactRespawn, setArtifactRespawn] = useLocalStorage<{ id: string; delay: number }>(
		'artifact-respawn',
	);

	return (
		<Stack direction='row' spacing={1}>
			<NotificationButton
				title='Artifacts Respawned'
				icon='/essence.png'
				delay={/*(24 * 60 + 3) * 6*/ 10 * 1000}
				onComplete={(id, delay) => setArtifactRespawn({ id, delay })}>
				Artifact Farming Notification
			</NotificationButton>
			{artifactRespawn && +new Date() < artifactRespawn.delay && (
				<Fragment>
					<AsyncButton
						onClick={async () => {
							await cancelNotification(subscription.toJSON(), artifactRespawn.id);
							setArtifactRespawn(null);
						}}>
						Cancel
					</AsyncButton>
					<Typography>
						Respawn Time: {new Date(artifactRespawn.delay).toLocaleString()}
					</Typography>
				</Fragment>
			)}
		</Stack>
	);
}
