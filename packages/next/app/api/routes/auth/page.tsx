'use client';

import PageBack from '@/components/page/pageBack';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { saveAuthToken } from './actions';

export default function Home() {
	const { enqueueSnackbar } = useSnackbar();
	const [token, setToken] = useState('');

	return (
		<Container maxWidth='sm'>
			<PageBack backButton />
			<Stack spacing={1} sx={{ mt: 8 }}>
				<TextField
					label='AUTH_TOKEN'
					variant='outlined'
					fullWidth
					value={token}
					onChange={(e) => setToken(e.target.value)}
				/>
				<Button
					variant='contained'
					onClick={async () => {
						await saveAuthToken(token);
						enqueueSnackbar('Success');
					}}
					fullWidth>
					Save Token
				</Button>
			</Stack>
		</Container>
	);
}
