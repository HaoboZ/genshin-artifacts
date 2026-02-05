'use client';
import PageTitle from '@/components/page/pageTitle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { mainActions } from '@/store/reducers/mainReducer';
import { Box, Button, ButtonGroup, Container, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { prop } from 'remeda';
import { useWindowEventListener } from 'rooks';

export default function Settings() {
	const main = useAppSelector(prop('main'));
	const good = useAppSelector(prop('good'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	useWindowEventListener('paste', ({ clipboardData }: ClipboardEvent) => {
		const item = clipboardData.items[0];
		if (item?.type !== 'application/json') return;
		const reader = new FileReader();
		reader.onload = (e) => {
			const { main, ...good } = JSON.parse(e.target.result as string);
			if (main) dispatch(mainActions.import(main));
			dispatch(goodActions.import(good));
			enqueueSnackbar('Imported');
		};
		reader.readAsText(item.getAsFile());
	});

	return (
		<Container>
			<PageTitle>Settings</PageTitle>
			<Stack spacing={1}>
				<ButtonGroup variant='contained' color='primary'>
					<Button component='label'>
						Import
						<input
							hidden
							type='file'
							accept='application/json'
							onChange={(e) => {
								if (!e.target.files) return;
								const reader = new FileReader();
								reader.onload = (e) => {
									const { main, ...good } = JSON.parse(e.target.result as string);
									if (main) dispatch(mainActions.import(main));
									dispatch(goodActions.import(good));
									enqueueSnackbar('Imported');
								};
								reader.readAsText(e.target.files[0]);
							}}
						/>
					</Button>
					<Button
						onClick={() => {
							const a = document.createElement('a');
							a.href = URL.createObjectURL(
								new Blob([JSON.stringify({ main, ...good }, null, '\t')], {
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
			</Stack>
		</Container>
	);
}
