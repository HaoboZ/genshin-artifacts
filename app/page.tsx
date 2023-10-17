'use client';
import Page from '@/components/page';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Button, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function Main() {
	const good = useAppSelector(({ good }) => good);
	const dispatch = useAppDispatch();
	const snackbar = useSnackbar();

	return (
		<Page title='Genshin Artifacts'>
			<Button component='label' variant='contained'>
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
				variant='contained'
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
			<Button variant='contained' onClick={() => dispatch(goodActions.reset())}>
				Reset
			</Button>
			<Typography>Artifacts: {good.artifacts.length}</Typography>
			<Typography>Weapons: {good.weapons.length}</Typography>
		</Page>
	);
}
