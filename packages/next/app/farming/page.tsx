'use client';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import useEventListener from '../../src/hooks/useEventListener';
import RouteMap from './routeMap';
import { Point } from './routeMap/utils';
import VideoPlayer from './videoPlayer';

const currentRoute = 'Natlan/Easybreeze Market Alt';

export default function Farming() {
	const videoRef = useRef<HTMLVideoElement>(null);

	const [time, setTime] = useState(0);

	const { data } = useSWR<Point[]>(`/points/${currentRoute}.json`, async (url) => {
		const { data } = await axios.get(url);
		return data;
	});

	// eslint-disable-next-line react-hooks/refs
	useEventListener(videoRef.current, 'timeupdate', () => {
		setTime(videoRef.current.currentTime);
	});

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
						<Button variant='contained'>Prev</Button>
						<Button variant='contained'>Next</Button>
					</Box>
					<RouteMap
						src={currentRoute}
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
						src={currentRoute}
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
