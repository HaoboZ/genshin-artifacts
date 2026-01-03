'use client';
import PageTitle from '@/components/page/pageTitle';
import { Box, Container, Grid, Stack, TextField } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import FarmingMap from './farming';

const RespawnNotification = dynamic(() => import('@/components/respawnNotification'), {
	ssr: false,
});

export default function Main() {
	const [time, setTime] = useState(() => {
		const now = new Date();
		return now.toTimeString().slice(0, 8);
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;
		OneSignal.init({
			appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
			safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
			allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
		}).then();
	}, []);

	return (
		<Container>
			<PageTitle>Genshin Artifacts</PageTitle>
			<Grid container spacing={1}>
				<Grid
					size={{ xs: 12, md: 8 }}
					sx={{ height: { xs: 'calc(100vw * 9 / 16)', md: 'calc(100vh - 100px)' } }}>
					<FarmingMap sx={{ alignItems: 'unset' }} />
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
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
						<TextField
							fullWidth={false}
							type='time'
							slotProps={{ htmlInput: { step: 1 } }}
							value={time}
							onChange={({ target }) => setTime(target.value)}
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
				</Grid>
			</Grid>
		</Container>
	);
}
