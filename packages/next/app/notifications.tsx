'use client';

import { Box, Stack, TextField } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const RespawnNotification = dynamic(() => import('@/components/respawnNotification'), {
	ssr: false,
});

export default function Notifications() {
	const [time, setTime] = useState(() => {
		const now = new Date();
		return now.toTimeString().slice(0, 8);
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;
		window.OneSignalDeferred = window.OneSignalDeferred || [];
		window.OneSignalDeferred.push(async (OneSignal) => {
			await OneSignal.init({
				appId: 'c7a78eb3-5b60-4dca-907b-8dc2da208e61',
			});
		});
	}, []);

	return (
		<Stack spacing={1}>
			<Box className='onesignal-customlink-container' style={{ minHeight: 'unset' }} />
			<RespawnNotification
				storageKey='artifact-respawn'
				item='Artifacts Farming'
				icon='/icons/essence.png'
				notificationTime={() => {
					const now = new Date();
					now.setDate(now.getDate() + 1);
					now.setMinutes(now.getMinutes() + 2);
					return now;
				}}
			/>
			<RespawnNotification
				storageKey='specialties-respawn'
				item='Specialties Farming'
				icon='/icons/materials.png'
				notificationTime={() => {
					const now = new Date();
					now.setDate(now.getDate() + 2);
					now.setMinutes(now.getMinutes() + 2);
					return now;
				}}
			/>
			<RespawnNotification
				storageKey='crystals-respawn'
				item='Crystals Farming'
				icon='/icons/crystal.png'
				notificationTime={() => {
					const now = new Date();
					now.setDate(now.getDate() + 3);
					now.setMinutes(now.getMinutes() + 2);
					return now;
				}}
			/>
			<RespawnNotification
				storageKey='parametric-transformer'
				item='Parametric Transformer'
				icon='/icons/materials.png'
				notificationTime={() => {
					const now = new Date();
					now.setDate(now.getDate() + 6);
					now.setHours(now.getHours() + 22);
					now.setMinutes(now.getMinutes() + 2);
					return now;
				}}
			/>
			<TextField
				fullWidth={false}
				type='time'
				slotProps={{ htmlInput: { step: 1 } }}
				value={time}
				onChange={(e) => setTime(e.target.value)}
			/>
			<RespawnNotification
				storageKey='custom'
				item='Custom'
				notificationTime={() => {
					const tomorrow = new Date();
					tomorrow.setDate(tomorrow.getDate() + 1);

					const timeParts = time.split(':');
					const hours = parseInt(timeParts[0]);
					const minutes = parseInt(timeParts[1]);
					const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

					tomorrow.setHours(hours, minutes, seconds, 0);
					return tomorrow;
				}}
			/>
		</Stack>
	);
}
