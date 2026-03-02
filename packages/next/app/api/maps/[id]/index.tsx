'use client';

import type { Point } from '@/components/imageRoute/types';
import { Container, Grid } from '@mui/material';
import { useState } from 'react';
import type { MapData } from '../../routes/types';
import MapControls from './controls';
import MapEditor from './mapEditor';

export default function Map({ mapData }: { mapData: MapData }) {
	const [editableMapData, setEditableMapData] = useState<MapData>(mapData);
	const [points, setPoints] = useState<Point[]>(mapData.points);

	return (
		<Container>
			<Grid container spacing={1}>
				<Grid size={12}>
					<MapControls mapData={editableMapData} originalMapData={mapData} points={points} />
				</Grid>
				{editableMapData.image && (
					<MapEditor
						mapData={editableMapData}
						setMapData={setEditableMapData}
						points={points}
						setPoints={setPoints}
					/>
				)}
			</Grid>
		</Container>
	);
}
