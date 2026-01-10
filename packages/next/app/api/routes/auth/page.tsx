'use client';

import PageBack from '@/components/page/pageBack';
import { Box, Button, Container, TextField } from '@mui/material';
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

export default function Home() {
	const { enqueueSnackbar } = useSnackbar();
	const [token, setToken] = useState('');

	return (
		<Container maxWidth='sm'>
			<PageBack />
			<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField
					label='AUTH_TOKEN'
					variant='outlined'
					fullWidth
					value={token}
					onChange={(e) => setToken(e.target.value)}
				/>
				<Button
					variant='contained'
					onClick={() => {
						Cookies.set('AUTH_TOKEN', token, { expires: 7 });
						enqueueSnackbar('Success');
					}}
					fullWidth>
					Save Token
				</Button>
			</Box>
		</Container>
	);
}
