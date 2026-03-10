'use client';

import { Container, Grid } from '@mui/material';
import type { Point } from 'image-map-route';
import { useState } from 'react';
import { type MapData, type Text } from '../../routes/types';
import MapControls from './controls';
import MapEditor from './mapEditor';

export default function Map({ mapData }: { mapData: MapData }) {
	const [text, setText] = useState<Text[]>(mapData.text);
	const [points, setPoints] = useState<Point[]>(mapData.points);

	return (
		<Container>
			<Grid container spacing={1}>
				<Grid size={12}>
					<MapControls mapData={mapData} text={text} points={points} />
				</Grid>
				{mapData.image && (
					<MapEditor
						mapData={mapData}
						text={text}
						setText={setText}
						points={points}
						setPoints={setPoints}
					/>
				)}
			</Grid>
		</Container>
	);
}
