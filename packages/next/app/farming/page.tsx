'use client';
import { routesInfo } from '@/api/routes';
import ImageRoute from '@/components/imageRoute';
import type { Point } from '@/components/imageRoute/types';
import PageTitle from '@/components/page/pageTitle';
import { Button, Container, MenuItem, Select } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { MapRenderPath, MapRenderPoint } from './render';

export default function Farming() {
	const [selectedRoute, setSelectedRoute] = useState(0);
	const { data } = useSWR<Point[]>(`/points/route_${selectedRoute}.json`, async (url: string) => {
		const { data } = await axios.get(url);
		return data;
	});

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
			<ImageRoute
				src='teyvat'
				route={selectedRoute.toString()}
				points={data}
				sx={{ aspectRatio: '16 / 9' }}
				RenderPoint={MapRenderPoint}
				RenderPath={MapRenderPath}
			/>
		</Container>
	);
}
