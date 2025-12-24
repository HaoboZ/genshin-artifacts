'use client';
import route from '@/api/route.json';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import useEventListener from '@/src/hooks/useEventListener';
import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import RouteMap from './routeMap';
import { type Point } from './routeMap/utils';
import VideoPlayer from './videoPlayer';

const maps = route[0].maps;

export default function Farming() {
	const videoRef = useRef<HTMLVideoElement>(null);

	const [selectedRoute, setSelectedRoute] = useState(maps[0].src);
	const [time, setTime] = useState(0);

	const { data } = useSWR<Point[]>(`/points/${selectedRoute}.json`, async (url) => {
		const { data } = await axios.get(url);
		return data;
	});

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => {
		setTime(videoRef.current.currentTime);
	});

	const currentIndex = maps.findIndex(({ src }) => src === selectedRoute);

	return (
		<PageContainer>
			<PageTitle>Artifact Farming</PageTitle>
			<Box
				sx={{
					width: '100%',
					height: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<Box
					sx={{
						width: '100%',
						maxWidth: 'calc(100vh * 16 / 9)',
						aspectRatio: '16 / 9',
						display: 'grid',
						gridTemplate: '1fr 1fr',
						border: '1px solid blue',
					}}>
					<Box
						sx={{
							gridColumn: 1,
							gridRow: 1,
							justifySelf: 'start',
							alignSelf: 'start',
							width: '50%',
						}}>
						<Typography variant='h1'>Total Artifacts</Typography>
						<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
							<Button
								variant='outlined'
								onClick={() => {
									if (currentIndex <= 0) return;
									setSelectedRoute(maps[currentIndex - 1].src);
								}}
								disabled={currentIndex <= 0}>
								Previous
							</Button>
							<Select
								value={selectedRoute}
								onChange={({ target }) => setSelectedRoute(target.value)}>
								{maps.map(({ src }) => (
									<MenuItem key={src} value={src}>
										{src}
									</MenuItem>
								))}
							</Select>
							<Button
								variant='outlined'
								onClick={() => {
									if (currentIndex >= maps.length - 1) return;
									setSelectedRoute(maps[currentIndex + 1].src);
								}}
								disabled={currentIndex >= maps.length - 1}>
								Next
							</Button>
						</Stack>
					</Box>
					<RouteMap
						src={selectedRoute}
						points={data ?? []}
						time={time}
						setTime={(time) => {
							setTime(time);
							if (!videoRef.current) return;
							videoRef.current.currentTime = time;
						}}
						sx={{
							gridColumn: 1,
							gridRow: 1,
							justifySelf: 'end',
							alignSelf: 'start',
							width: '50%',
						}}
					/>
					<VideoPlayer
						ref={videoRef}
						src={selectedRoute}
						sx={{
							gridColumn: 1,
							gridRow: 1,
							justifySelf: 'start',
							alignSelf: 'end',
							width: '55%',
						}}
					/>
				</Box>
			</Box>
		</PageContainer>
	);
}
