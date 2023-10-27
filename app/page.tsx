'use client';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Button, ButtonGroup, Typography } from '@mui/joy';
import { useSnackbar } from 'notistack';

export default function Main() {
	const good = useAppSelector(pget('good'));
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
								dispatch(goodActions.import(JSON.parse(target.result as string)));
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
							new Blob([JSON.stringify(good, null, 2)], { type: 'text/plain' }),
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
		</PageContainer>
	);
}
