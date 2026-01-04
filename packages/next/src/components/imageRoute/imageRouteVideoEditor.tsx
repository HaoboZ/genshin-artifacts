import { RouteRenderPoint } from '@/app/farming/[route]/render';
import { Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { type ComponentType, Fragment, useCallback, useState } from 'react';
import { pick } from 'remeda';
import VideoPlayer from '../videoPlayer';
import ImageRoute from './index';
import TimePointControls from './timePointControls';
import type { ImageRouteProps, Point, RenderExtraProps, Spot } from './types';
import useRouteVideoSync from './useRouteVideoSync';

export default function ImageRouteVideoEditor({
	alt,
	imageSrc,
	videoSrc,
	points: initialPoints,
	savePoints,
	RenderText,
	RenderExtra,
	...props
}: {
	alt: string;
	imageSrc: string;
	videoSrc: string;
	savePoints: (points: Point[]) => void;
	RenderText?: ComponentType<{ points: Point[]; time: number }>;
} & ImageRouteProps) {
	const [points, setPoints] = useState<Point[]>(initialPoints);

	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	const [selectedSpot, setSelectedSpot] = useState<Spot>(() => ({
		point: points[0],
		pointIndex: 0,
		percentage: 0,
	}));

	const updatePointField = (index: number, field: string, value: number) => {
		setPoints((prevPoints) => {
			const newPoints = [...prevPoints];
			if (index >= 0 && index < newPoints.length) {
				const updatedPoint = { ...newPoints[index] };
				if (value === undefined) {
					delete updatedPoint[field];
				} else {
					updatedPoint[field] = value;
				}
				newPoints[index] = updatedPoint;
			}
			return newPoints;
		});
	};

	const currentPointIndex = selectedSpot?.pointIndex ?? 0;
	const nextPointIndex = currentPointIndex !== null ? currentPointIndex + 1 : null;

	const RenderExtraSelected = useCallback(
		(props: RenderExtraProps) => (
			<Fragment>
				{RenderExtra && <RenderExtra {...props} />}
				{selectedSpot && (
					<RouteRenderPoint
						point={selectedSpot.point}
						containerSize={props.containerSize}
						scale={props.scale}
						type='extra'
					/>
				)}
			</Fragment>
		),
		[RenderExtra, selectedSpot],
	);

	return (
		<Box>
			<Box sx={{ position: 'absolute', width: '50%', height: '100%', overflow: 'auto' }}>
				<Stack spacing={1} sx={{ p: 1 }}>
					{RenderText && <RenderText points={points} time={time} />}
					<Typography>Current Time: {time.toFixed(2)}s</Typography>
					<Grid container>
						<TimePointControls
							name='Current'
							time={time}
							point={
								currentPointIndex !== null && currentPointIndex >= 0
									? points?.[currentPointIndex]
									: null
							}
							pointIndex={currentPointIndex}
							updatePointField={updatePointField}
						/>
						<TimePointControls
							name='Next'
							time={time}
							point={
								nextPointIndex !== null && nextPointIndex < points?.length
									? points?.[nextPointIndex]
									: null
							}
							pointIndex={nextPointIndex}
							updatePointField={updatePointField}
						/>
					</Grid>
				</Stack>
			</Box>
			<Box sx={{ position: 'absolute', width: '50%', right: 0 }}>
				<ImageRoute
					ref={routeRef}
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					RenderExtra={RenderExtraSelected}
					{...props}>
					<Image fill alt={alt} src={imageSrc} style={{ zIndex: -1, objectFit: 'contain' }} />
				</ImageRoute>
				<Stack direction='row' spacing={1} sx={{ position: 'absolute', top: 10, left: 10 }}>
					<Button
						size='small'
						variant='contained'
						sx={{ minWidth: 'unset' }}
						onClick={() => savePoints(points)}>
						<SaveIcon />
					</Button>
					<Button
						variant='contained'
						size='small'
						disabled={currentPointIndex <= 0}
						onClick={() => {
							setSelectedSpot({
								point: points[currentPointIndex - 1],
								pointIndex: currentPointIndex - 1,
								percentage: 0,
							});
						}}>
						Prev Point
					</Button>
					<Button
						variant='contained'
						size='small'
						disabled={nextPointIndex >= points?.length}
						onClick={() => {
							setSelectedSpot({
								point: points[currentPointIndex + 1],
								pointIndex: currentPointIndex + 1,
								percentage: 0,
							});
						}}>
						Next Point
					</Button>
					<Button
						variant='contained'
						size='small'
						onClick={() => {
							setPoints((points) => {
								const newPoints = [...points];
								newPoints.splice(nextPointIndex, 0, pick(selectedSpot.point, ['x', 'y']));
								return newPoints;
							});
						}}>
						Duplicate
					</Button>
				</Stack>
			</Box>
			<VideoPlayer
				ref={videoRef}
				src={videoSrc}
				seekFrames={1}
				sx={{ position: 'absolute', bottom: 0, width: '50%' }}
			/>
		</Box>
	);
}
