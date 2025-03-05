'use client';
import ClientOnly from '@/components/clientOnly';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import useEventListener from '@/src/hooks/useEventListener';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Box, Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import pget from '../src/helpers/pget';
import RespawnNotification from './respawnNotification';

export default function Main() {
	const main = useAppSelector(pget('main'));
	const good = useAppSelector(pget('good'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

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
				<Box>
					<Typography>Characters: {good.characters.length}</Typography>
					<Typography>Artifacts: {good.artifacts.length}</Typography>
					<Typography>Weapons: {good.weapons.length}</Typography>
				</Box>
				<ClientOnly>
					<RespawnNotification />
				</ClientOnly>
				{/*<Grid2 size={12} />*/}
				{/*<Grid2>*/}
				{/*	<NotificationButton*/}
				{/*		title='Specialties Respawned'*/}
				{/*		icon='/materials.png'*/}
				{/*		delay={(2 * 24 * 60 + 3) * 60 * 1000}*/}
				{/*		onComplete={(id, delay) => {*/}
				{/*			dispatch(mainActions.setMaterialRespawn(+new Date() + delay));*/}
				{/*		}}>*/}
				{/*		Specialty Farming Notification*/}
				{/*	</NotificationButton>*/}
				{/*</Grid2>*/}
				{/*<Grid2 sx={{ display: 'flex', alignItems: 'center' }}>*/}
				{/*	{main.materialRespawn && +new Date() < main.materialRespawn && (*/}
				{/*		<Typography>*/}
				{/*			Respawn Time: {new Date(main.materialRespawn).toLocaleString()}*/}
				{/*		</Typography>*/}
				{/*	)}*/}
				{/*</Grid2>*/}
				{/*<Grid2 size={12} />*/}
				{/*<Grid2>*/}
				{/*	<NotificationButton*/}
				{/*		title='Crystals Respawned'*/}
				{/*		icon='/crystal.png'*/}
				{/*		delay={(3 * 24 * 60 + 3) * 60 * 1000}*/}
				{/*		onComplete={(id, delay) =>*/}
				{/*			dispatch(mainActions.setCrystalRespawn(+new Date() + delay))*/}
				{/*		}>*/}
				{/*		Crystal Farming Notification*/}
				{/*	</NotificationButton>*/}
				{/*</Grid2>*/}
				{/*<Grid2 sx={{ display: 'flex', alignItems: 'center' }}>*/}
				{/*	{main.crystalRespawn && +new Date() < main.crystalRespawn && (*/}
				{/*		<Typography>*/}
				{/*			Respawn Time: {new Date(main.crystalRespawn).toLocaleString()}*/}
				{/*		</Typography>*/}
				{/*	)}*/}
				{/*</Grid2>*/}
			</Stack>
		</PageContainer>
	);
}
