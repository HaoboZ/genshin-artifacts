'use client';
import Page from '@/components/page';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Button, ButtonGroup, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function Main() {
	const good = useAppSelector(({ good }) => good);
	const dispatch = useAppDispatch();
	const snackbar = useSnackbar();

	return (
		<Page noSsr title='Genshin Artifacts'>
			<ButtonGroup variant='contained'>
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
								dispatch(goodActions.import(JSON.parse(target.result as string)));
								snackbar.enqueueSnackbar('Imported');
							};
							reader.readAsText(target.files[0]);
						}}
					/>
				</Button>
				<Button
					onClick={() => {
						const a = document.createElement('a');
						a.href = URL.createObjectURL(
							new Blob([JSON.stringify(good, null, 2)], {
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
			<Typography>Artifacts: {good.artifacts.length}</Typography>
			<Typography>Weapons: {good.weapons.length}</Typography>
		</Page>
	);
}
