'use client';
import ClientOnly from '@/components/clientOnly';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import useEventListener from '@/src/hooks/useEventListener';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Box, Button, ButtonGroup, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import RespawnNotification from './respawnNotification';

export default function Main() {
	const main = useAppSelector(pget('main'));
	const good = useAppSelector(pget('good'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const [time, setTime] = useState(() => {
		const now = new Date();
		return now.toTimeString().slice(0, 8);
	});

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			const item = clipboardData.items[0];
			if (item?.type !== 'application/json') return;
			const reader = new FileReader();
			reader.onload = ({ target }) => {
				const { main, ...good } = JSON.parse(target.result as string);
				if (main) dispatch(mainActions.import(main));
				dispatch(goodActions.import(good));
				enqueueSnackbar('Imported');
			};
			reader.readAsText(item.getAsFile());
		},
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		OneSignal.init({
			appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
			safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
			allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
		}).then();
	}, []);

	return (
		<PageContainer>
			<PageTitle>Genshin Artifacts</PageTitle>
			<Stack spacing={1}>
				<ButtonGroup variant='contained' color='primary'>
					<Button component='label'>
						Import
						<input
							hidden
							type='file'
							accept='application/json'
							onChange={({ target }) => {
								if (!target.files) return;
								const reader = new FileReader();
								reader.onload = ({ target }) => {
									const { main, ...good } = JSON.parse(target.result as string);
									if (main) dispatch(mainActions.import(main));
									dispatch(goodActions.import(good));
									enqueueSnackbar('Imported');
								};
								reader.readAsText(target.files[0]);
							}}
						/>
					</Button>
					<Button
						onClick={() => {
							const a = document.createElement('a');
							a.href = URL.createObjectURL(
								new Blob([JSON.stringify({ main, ...good }, null, 2)], {
									type: 'text/plain',
								}),
							);
							a.setAttribute('download', 'genshinArtifacts.json');
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						}}>
						Export
					</Button>
					<Button onClick={() => dispatch(goodActions.reset())}>Reset</Button>
				</ButtonGroup>
				<Box>
					<Typography>Characters: {good.characters.length}</Typography>
					<Typography>Artifacts: {good.artifacts.length}</Typography>
					<Typography>Weapons: {good.weapons.length}</Typography>
				</Box>
				<Box className='onesignal-customlink-container' style={{ minHeight: 'unset' }} />
				<ClientOnly>
					<RespawnNotification
						storageKey='test-notification'
						item='Test'
						notificationTime={() => {
							const now = new Date();
							now.setMinutes(now.getMinutes() + 2);
							return now;
						}}
					/>
					<RespawnNotification
						storageKey='artifact-respawn'
						item='Artifacts Farming'
						icon='/essence.png'
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
						icon='/materials.png'
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
						icon='/crystal.png'
						notificationTime={() => {
							const now = new Date();
							now.setDate(now.getDate() + 3);
							now.setMinutes(now.getMinutes() + 2);
							return now;
						}}
					/>
					<Stack spacing={1} direction='row'>
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
				</ClientOnly>
			</Stack>
		</PageContainer>
	);
}
