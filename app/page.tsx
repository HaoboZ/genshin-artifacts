'use client';
import NotificationButton from '@/components/notificationButton';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import useEventListener from '@/src/hooks/useEventListener';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Button, ButtonGroup, Grid2, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

export default function Main() {
	const main = useAppSelector(pget('main'));
	const good = useAppSelector(pget('good'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		if (!('serviceWorker' in navigator && 'Notification' in window)) return;

		// Register service worker
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				console.log('Service Worker registered with scope:', registration.scope);
			})
			.catch((error) => {
				console.error('Service Worker registration failed:', error);
			});
	}, []);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			const item = clipboardData.items[0];
			if (item?.type !== 'application/json') return;
			const reader = new FileReader();
			reader.onload = ({ target }) => {
				const { main, ...good } = JSON.parse(target.result as string);
				if (main) dispatch(mainActions.setMain(main));
				dispatch(goodActions.import(good));
				enqueueSnackbar('Imported');
			};
			reader.readAsText(item.getAsFile());
		},
	);

	return (
		<PageContainer>
			<PageTitle>Genshin Artifacts</PageTitle>
			<Grid2 container spacing={1}>
				<Grid2 size={12}>
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
										if (main) dispatch(mainActions.setMain(main));
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
				</Grid2>
				<Grid2 size={12}>
					<Typography>Characters: {good.characters.length}</Typography>
					<Typography>Artifacts: {good.artifacts.length}</Typography>
					<Typography>Weapons: {good.weapons.length}</Typography>
				</Grid2>
				<Grid2>
					<NotificationButton
						title='Artifacts Respawned'
						icon='/essence.png'
						delay={(24 * 60 + 3) * 60 * 1000}
						onComplete={(delay) =>
							dispatch(mainActions.setArtifactRespawn(+new Date() + delay))
						}>
						Artifact Farming Notification
					</NotificationButton>
				</Grid2>
				<Grid2 sx={{ display: 'flex', alignItems: 'center' }}>
					{main.artifactRespawn && +new Date() < main.artifactRespawn && (
						<Typography>
							Respawn Time: {new Date(main.artifactRespawn).toDateString()}
						</Typography>
					)}
				</Grid2>
				<Grid2 size={12} />
				<Grid2>
					<NotificationButton
						title='Specialties Respawned'
						icon='/materials.png'
						delay={(2 * 24 * 60 + 3) * 60 * 1000}
						onComplete={(delay) => {
							dispatch(mainActions.setMaterialRespawn(+new Date() + delay));
						}}>
						Specialty Farming Notification
					</NotificationButton>
				</Grid2>
				<Grid2 sx={{ display: 'flex', alignItems: 'center' }}>
					{main.materialRespawn && +new Date() < main.materialRespawn && (
						<Typography>
							Respawn Time: {new Date(main.materialRespawn).toDateString()}
						</Typography>
					)}
				</Grid2>
				<Grid2 size={12} />
				<Grid2>
					<NotificationButton
						title='Crystals Respawned'
						icon='/crystal.png'
						delay={(3 * 24 * 60 + 3) * 60 * 1000}
						onComplete={(delay) =>
							dispatch(mainActions.setCrystalRespawn(+new Date() + delay))
						}>
						Crystal Farming Notification
					</NotificationButton>
				</Grid2>
				<Grid2 sx={{ display: 'flex', alignItems: 'center' }}>
					{main.crystalRespawn && +new Date() < main.crystalRespawn && (
						<Typography>
							Respawn Time: {new Date(main.crystalRespawn).toDateString()}
						</Typography>
					)}
				</Grid2>
			</Grid2>
		</PageContainer>
	);
}
