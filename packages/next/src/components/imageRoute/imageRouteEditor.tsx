'use client';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Image from 'next/image';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { pick } from 'remeda';
import { useKey } from 'rooks';
import useHistory from '../../hooks/useHistory';
import ImageRoute from './index';
import { type ImageRouteProps, type Point, type Spot } from './types';

export default function ImageRouteEditor({
	imageSrc,
	alt,
	points,
	setPoints,
	...props
}: {
	imageSrc: string;
	alt: string;
	setPoints: Dispatch<SetStateAction<Point[]>>;
} & ImageRouteProps) {
	const [editMode, setEditMode] = useState<string>('add');
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	useHistory(points, setPoints);

	useKey(['Delete'], (e) => {
		if (!activeSpot) return;
		e.preventDefault();
		setPoints((points) => {
			const newPoints = [...points];
			newPoints.splice(activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0), 1);
			return newPoints;
		});
		setActiveSpot(null);
	});

	return (
		<Box sx={{ position: 'relative' }}>
			<ImageRoute
				points={points}
				addPoint={
					editMode === 'add' || activeSpot?.pointIndex !== undefined
						? (point) => {
								point.marked = 999;
								setActiveSpot(null);
								setPoints((points) => {
									switch (editMode) {
										case 'add':
											return [...points, point];
										case 'relocate':
											const newPoints = [...points];
											newPoints[activeSpot.pointIndex] = {
												...newPoints[activeSpot.pointIndex],
												...pick(point, ['x', 'y']),
											};
											return newPoints;
										case 'insert':
											return points.toSpliced(activeSpot.pointIndex, 0, point);
									}
								});
							}
						: undefined
				}
				activeSpot={activeSpot}
				setActiveSpot={({ percentage, pointIndex }) => {
					pointIndex += percentage ? 1 : 0;
					setActiveSpot({ point: points[pointIndex], pointIndex, percentage: 0 });
				}}
				{...props}>
				<Image fill alt={alt} src={imageSrc} style={{ zIndex: -1, objectFit: 'contain' }} />
			</ImageRoute>
			<Stack direction='row' spacing={1} sx={{ position: 'absolute', top: 10, left: 10 }}>
				<Button
					size='small'
					variant='contained'
					disabled={!points?.length}
					onClick={() => setPoints([])}>
					Clear
				</Button>
				<ToggleButtonGroup
					size='small'
					exclusive
					value={editMode}
					sx={{ bgcolor: 'background.paper' }}
					onChange={(_, value) => setEditMode(value)}>
					<ToggleButton value='add'>Add</ToggleButton>
					<ToggleButton value='relocate'>Relocate</ToggleButton>
					<ToggleButton value='insert'>Insert</ToggleButton>
				</ToggleButtonGroup>
				<Button
					size='small'
					variant='contained'
					disabled={!activeSpot}
					onClick={() => setActiveSpot(null)}>
					Clear Active
				</Button>
			</Stack>
		</Box>
	);
}
