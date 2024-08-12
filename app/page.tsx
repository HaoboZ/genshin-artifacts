'use client';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import useEventListener from '@/src/hooks/useEventListener';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Button, ButtonGroup, Typography } from '@mui/joy';
import { useSnackbar } from 'notistack';

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
		<PageContainer noSsr>
			<PageTitle>Genshin Artifacts</PageTitle>
			<ButtonGroup variant='solid' color='primary'>
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
				{/*<Button component='label'>*/}
				{/*	Replace Set*/}
				{/*	<input*/}
				{/*		hidden*/}
				{/*		type='file'*/}
				{/*		accept='application/json'*/}
				{/*		onChange={({ target }) => {*/}
				{/*			if (!target.files) return;*/}
				{/*			const reader = new FileReader();*/}
				{/*			reader.onload = ({ target }) => {*/}
				{/*				const good = JSON.parse(target.result as string);*/}
				{/*				dispatch(goodActions.importArtifactSet(good));*/}
				{/*				enqueueSnackbar('Imported');*/}
				{/*			};*/}
				{/*			reader.readAsText(target.files[0]);*/}
				{/*		}}*/}
				{/*	/>*/}
				{/*</Button>*/}
				<Button onClick={() => dispatch(goodActions.reset())}>Reset</Button>
			</ButtonGroup>
			<Typography>Characters: {good.characters.length}</Typography>
			<Typography>Artifacts: {good.artifacts.length}</Typography>
			<Typography>Weapons: {good.weapons.length}</Typography>
		</PageContainer>
	);
}
