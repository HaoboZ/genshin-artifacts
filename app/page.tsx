'use client';
import Page from '@/components/page';
import { Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useAsyncEffect } from 'rooks';

export default function Main() {
	const [data, setData] = useState('Loading...');

	useAsyncEffect(async () => {
		const { data } = await axios.get('api/helloWorld');
		setData(data);
	}, []);

	return (
		<Page>
			<Typography>{data}</Typography>
		</Page>
	);
}
