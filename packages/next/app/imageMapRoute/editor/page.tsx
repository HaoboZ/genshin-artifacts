'use client';

import type { MapData, Text } from '@/api/routes/types';
import PageTitle from '@/components/page/pageTitle';
import { Button, Container, Grid, Stack } from '@mui/material';
import type { Point } from 'image-map-route';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import MapEditor from '../../api/maps/[id]/mapEditor';

export default function ImageMapRouteEditor() {
	const [text, setText] = useState<Text[]>([]);
	const [points, setPoints] = useState<Point[]>([]);
	const [imageUrl, setImageUrl] = useState<string>(null);
	const [videoUrl, setVideoUrl] = useState<string>(null);

	const mapData = useMemo<MapData>(
		() => ({
			id: nanoid(),
			name: 'Editor',
			image: imageUrl ?? undefined,
			video: videoUrl ?? undefined,
			text,
			points,
		}),
		[imageUrl, videoUrl, text, points],
	);

	return (
		<Container>
			<PageTitle>Editor</PageTitle>
			<Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
				<Button
					variant='outlined'
					onClick={() => {
						const nextUrl = window.prompt('Enter image URL');
						if (!nextUrl) return;
						setImageUrl(nextUrl);
					}}>
					Set Image URL
				</Button>
				<Button
					variant='outlined'
					onClick={() => {
						const nextUrl = window.prompt('Enter video URL');
						if (!nextUrl) return;
						setVideoUrl(nextUrl);
					}}>
					Set Video URL
				</Button>
				<Button variant='outlined' component='label'>
					Import JSON
					<input
						type='file'
						accept='application/json'
						hidden
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (!file) return;
							const reader = new FileReader();
							reader.onload = () => {
								const parsed = JSON.parse(String(reader.result ?? '{}')) as MapData;
								setText(parsed.text ?? []);
								setPoints(parsed.points ?? []);
								setImageUrl(parsed.image ?? null);
								setVideoUrl(parsed.video ?? null);
							};
							reader.readAsText(file);
							event.currentTarget.value = '';
						}}
					/>
				</Button>
				<Button
					variant='outlined'
					onClick={() => {
						const payload = JSON.stringify(mapData, null, 2);
						const blob = new Blob([payload], { type: 'application/json' });
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = 'mapData.json';
						link.click();
						URL.revokeObjectURL(url);
					}}>
					Export JSON
				</Button>
			</Stack>
			<Grid container spacing={1}>
				<MapEditor
					mapData={mapData}
					text={text}
					setText={setText}
					points={points}
					setPoints={setPoints}
				/>
			</Grid>
		</Container>
	);
}
