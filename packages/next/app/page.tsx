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
					<RespawnNotification
						key='artifact-respawn'
						item='Artifacts'
						icon='/essence.png'
						delay={24 * 60 + 2}
					/>
					<RespawnNotification
						key='specialties-respawn'
						item='Specialties'
						icon='/material.png'
						delay={2 * 24 * 60 + 2}
					/>
					<RespawnNotification
						key='crystals-respawn'
						item='Crystals'
						icon='/crystal.png'
						delay={3 * 24 * 60 + 2}
					/>
				</ClientOnly>
			</Stack>
		</PageContainer>
	);
}
