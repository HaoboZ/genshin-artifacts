'use client';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Button, ButtonGroup, Typography } from '@mui/joy';
import { useSnackbar } from 'notistack';

export default function Main() {
	const { main, good } = useAppSelector((state) => state);
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

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
								const { tier, ...good } = JSON.parse(target.result as string);
								dispatch(goodActions.import(good));
								if (tier) dispatch(mainActions.setPriority(tier));
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
							new Blob([JSON.stringify({ tier: main.priority, ...good }, null, 2)], {
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
			<Typography>Characters: {good.characters.length}</Typography>
			<Typography>Artifacts: {good.artifacts.length}</Typography>
			<Typography>Weapons: {good.weapons.length}</Typography>
		</PageContainer>
	);
}
