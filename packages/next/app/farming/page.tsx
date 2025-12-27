'use client';
import { routesInfo } from '@/api/routes';
import PageTitle from '@/components/page/pageTitle';
import { Button, Container, MenuItem, Select } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

export default function Farming() {
	const [selectedRoute, setSelectedRoute] = useState(0);

	return (
		<Container>
			<PageTitle>Artifact Farming</PageTitle>
			<Select
				value={selectedRoute}
				onChange={({ target }) => {
					setSelectedRoute(target.value);
				}}>
				{routesInfo.map(({ spots, mora }, index) => (
					<MenuItem key={index} value={index}>
						Spots: {spots}, Mora: {mora}
					</MenuItem>
				))}
			</Select>
			<Button
				variant='contained'
				component={Link}
				href={`/farming/${selectedRoute}`}
				sx={{ ml: 1 }}>
				Go
			</Button>
		</Container>
	);
}
