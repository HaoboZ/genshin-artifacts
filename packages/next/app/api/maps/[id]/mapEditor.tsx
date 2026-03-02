import FormattedTextField from '@/components/formattedTextField';
import ImageRoute from '@/components/imageRoute';
import type { Point, Spot } from '@/components/imageRoute/types';
import useRouteVideoSync from '@/components/imageRoute/useRouteVideoSync';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import VideoPlayer from '@/components/videoPlayer';
import useHistory from '@/hooks/useHistory';
import {
	Box,
	Button,
	Grid,
	List,
	ListItemButton,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import Image from 'next/image';
import {
	type ChangeEvent,
	type Dispatch,
	Fragment,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { pick } from 'remeda';
import { RouteRenderExtra, RouteRenderPath, RouteRenderPoint } from '../../../farming/[id]/render';
import { type MapData } from '../../routes/types';

export default function MapEditor({
	mapData,
	setMapData,
	points,
	setPoints,
}: {
	mapData: MapData;
	setMapData: Dispatch<SetStateAction<MapData>>;
	points: Point[];
	setPoints: Dispatch<SetStateAction<Point[]>>;
}) {
	const [selectedPointIndex, setSelectedPointIndex] = useState(0);
	const [placingTextIndex, setPlacingTextIndex] = useState<number | null>(null);
	const [isShiftPressed, setIsShiftPressed] = useState(false);
	const [isCtrlPressed, setIsCtrlPressed] = useState(false);

	const { routeRef, videoRef, time, setTime, activeSpot, setActiveSpot } =
		useRouteVideoSync(points);

	useHistory(points, setPoints);

	const selectedPoint = points[selectedPointIndex];

	const handleDeletePoint = useCallback(
		() => {
			if (!selectedPoint) return;
			setPoints((prev) => prev.filter((_, i) => i !== selectedPointIndex));
			setSelectedPointIndex(Math.max(0, selectedPointIndex - 1));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[points],
	);

	const updateSelectedPoint = (field: keyof Point, value: number | string | undefined) => {
		if (!selectedPoint) return;
		setPoints((prev) => {
			const next = [...prev];
			next[selectedPointIndex] = { ...selectedPoint, [field]: value };
			return next;
		});
	};

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Shift') setIsShiftPressed(true);
			if (e.key === 'Control') setIsCtrlPressed(true);
			const target = e.target as HTMLElement | null;
			const isTypingTarget = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);
			if (e.key === 'Delete' && !isTypingTarget) {
				e.preventDefault();
				handleDeletePoint();
			}
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Shift') setIsShiftPressed(false);
			if (e.key === 'Control') setIsCtrlPressed(false);
		};
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	}, [handleDeletePoint, selectedPointIndex]);

	const markedCount = useMemo(
		() => points.filter((p) => p?.marked !== undefined).length,
		[points],
	);

	const mappedPoints = points.map((point, i) =>
		i === selectedPointIndex ? { ...point, extra: 'hover' } : point,
	);

	const updateMapTextPosition = (textIndex: number, field: 'x' | 'y', value: number) => {
		setMapData((prev) => {
			const nextText = [...(prev.text ?? [])];
			if (!nextText[textIndex]) return prev;
			nextText[textIndex] = { ...nextText[textIndex], [field]: value };
			return { ...prev, text: nextText };
		});
	};

	return (
		<Fragment>
			<Grid size={{ xs: 12, sm: 6 }}>
				<Stack spacing={1}>
					<Paper sx={{ p: 1 }}>
						<Typography variant='subtitle2' sx={{ mb: 1 }}>
							{placingTextIndex !== null
								? `Click map to set text #${placingTextIndex + 1} position`
								: 'Click: add | Shift + Click: insert | Ctrl + Click: move'}
						</Typography>
						<ImageRoute
							ref={routeRef}
							points={mappedPoints}
							addPoint={(point) => {
								const newPoint = pick(point, ['x', 'y']);
								if (placingTextIndex !== null) {
									updateMapTextPosition(placingTextIndex, 'x', newPoint.x);
									updateMapTextPosition(placingTextIndex, 'y', newPoint.y);
									setMapData((prev) => {
										const nextText = [...(prev.text ?? [])];
										if (!nextText[placingTextIndex]) return prev;
										nextText[placingTextIndex] = {
											...nextText[placingTextIndex],
											...newPoint,
										};
										return { ...prev, text: nextText };
									});
									setPlacingTextIndex(null);
									return;
								}
								if (!selectedPoint) return;
								setPoints((prev) => {
									if (isCtrlPressed) {
										const newPoints = [...prev];
										newPoints[selectedPointIndex] = { ...selectedPoint, ...newPoint };
										return newPoints;
									}
									if (isShiftPressed) {
										const insertIndex = selectedPointIndex + 1;
										return [
											...prev.slice(0, insertIndex),
											newPoint,
											...prev.slice(insertIndex),
										];
									}
									return [...prev, newPoint];
								});
							}}
							activeSpot={activeSpot}
							setActiveSpot={(spot: Spot) => {
								setActiveSpot(spot);
								if (spot?.pointIndex !== undefined) setSelectedPointIndex(spot.pointIndex);
							}}
							RenderPoint={RouteRenderPoint}
							RenderPath={RouteRenderPath}
							RenderExtra={RouteRenderExtra(mapData.text)}
							getInitialPosition={(containerSize) =>
								calculateOptimalZoom(points, containerSize, 0.75)
							}
							sx={{ aspectRatio: 1 }}>
							<Image
								fill
								alt={mapData.name}
								src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.image}`}
								style={{ zIndex: -1, objectFit: 'contain', pointerEvents: 'none' }}
							/>
						</ImageRoute>
					</Paper>
					<Paper sx={{ p: 1 }}>
						<Typography variant='subtitle2'>
							Points: {points.length}, Marked: {markedCount}
						</Typography>
						<List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
							{points.map((point, index) => (
								<ListItemButton
									key={index}
									selected={selectedPointIndex === index}
									onClick={() => setSelectedPointIndex(index)}>
									<Typography variant='body2'>
										#{index + 1} ({point.x.toFixed(3)}, {point.y.toFixed(3)})
										{point.marked !== undefined ? ` @ ${point.marked.toFixed(2)}s` : ''}
									</Typography>
								</ListItemButton>
							))}
						</List>
					</Paper>
				</Stack>
			</Grid>
			<Grid size={{ xs: 12, sm: 6 }}>
				<Stack spacing={1}>
					<Paper sx={{ p: 1 }}>
						<Typography variant='subtitle2' sx={{ mb: 1 }}>
							Point Editor
						</Typography>
						{selectedPoint ? (
							<Grid container spacing={1}>
								<Grid size={6}>
									<Button
										size='small'
										variant='contained'
										fullWidth
										disabled={!selectedPointIndex}
										onClick={() => setSelectedPointIndex((prev) => (prev ?? 1) - 1)}>
										Prev
									</Button>
								</Grid>
								<Grid size={6}>
									<Button
										size='small'
										variant='contained'
										fullWidth
										disabled={
											selectedPointIndex === null ||
											selectedPointIndex >= points.length - 1
										}
										onClick={() => setSelectedPointIndex((prev) => (prev ?? -1) + 1)}>
										Next
									</Button>
								</Grid>
								<Grid size={4}>
									<FormattedTextField
										size='small'
										label='Marked'
										type='number'
										value={selectedPoint.marked ?? ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											updateSelectedPoint(
												'marked',
												e.target.value ? +e.target.value : undefined,
											);
										}}
									/>
								</Grid>
								<Grid size={4}>
									<FormattedTextField
										size='small'
										label='Start'
										type='number'
										value={selectedPoint.start ?? ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											updateSelectedPoint(
												'start',
												e.target.value ? +e.target.value : undefined,
											);
										}}
									/>
								</Grid>
								<Grid size={4}>
									<FormattedTextField
										size='small'
										label='End'
										type='number'
										value={selectedPoint.end ?? ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											updateSelectedPoint(
												'end',
												e.target.value ? +e.target.value : undefined,
											);
										}}
									/>
								</Grid>
								<Grid size={4}>
									<Button
										size='small'
										variant='outlined'
										fullWidth
										onClick={() => updateSelectedPoint('marked', time)}>
										Set
									</Button>
								</Grid>
								<Grid size={4}>
									<Button
										size='small'
										variant='outlined'
										fullWidth
										onClick={() => updateSelectedPoint('start', time)}>
										Set
									</Button>
								</Grid>
								<Grid size={4}>
									<Button
										size='small'
										variant='outlined'
										fullWidth
										onClick={() => updateSelectedPoint('end', time)}>
										Set
									</Button>
								</Grid>
								<Grid size={12}>
									<TextField
										size='small'
										label='Type'
										select
										value={selectedPoint.type ?? ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											updateSelectedPoint('type', e.target.value || undefined)
										}>
										<MenuItem value=''>None</MenuItem>
										<MenuItem value='normal'>Normal</MenuItem>
										<MenuItem value='jump'>Jump</MenuItem>
										<MenuItem value='hidden'>Hidden</MenuItem>
									</TextField>
								</Grid>
								<Grid size={12}>
									<Button
										color='error'
										size='small'
										variant='outlined'
										fullWidth
										onClick={handleDeletePoint}>
										Delete Point
									</Button>
								</Grid>
							</Grid>
						) : (
							<Typography variant='body2'>Select a point to edit.</Typography>
						)}
					</Paper>
					{mapData.video && (
						<Paper sx={{ p: 1 }}>
							<Box sx={{ mt: 1 }}>
								<Typography variant='body2' sx={{ mb: 0.5 }}>
									Video Time: {time.toFixed(2)}s
								</Typography>
								<VideoPlayer
									ref={videoRef}
									src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${mapData.video}`}
									seekFrames={1}
									setTime={setTime}
								/>
							</Box>
						</Paper>
					)}
					<Paper sx={{ p: 1 }}>
						<Stack spacing={1}>
							<Typography variant='subtitle2'>Map Text</Typography>
							{(mapData.text ?? []).map((item, index) => (
								<Stack key={index} direction='row' spacing={1}>
									<TextField
										size='small'
										label={`Text ${index + 1}`}
										value={item.text}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											setMapData((prev) => {
												const nextText = [...(prev.text ?? [])];
												if (!nextText[index]) return prev;
												nextText[index] = {
													...nextText[index],
													text: e.target.value,
												};
												return { ...prev, text: nextText };
											});
										}}
										sx={{ flex: 1 }}
									/>
									<FormattedTextField
										size='small'
										label='Size'
										type='number'
										value={item.fontSize ? item.fontSize * 1000 : ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											setMapData((prev) => {
												const nextText = [...(prev.text ?? [])];
												if (!nextText[index]) return prev;
												nextText[index] = {
													...nextText[index],
													fontSize: e.target.value
														? +e.target.value / 1000
														: undefined,
												};
												return { ...prev, text: nextText };
											});
										}}
										sx={{ width: 75 }}
									/>
									<Button
										size='small'
										variant={placingTextIndex === index ? 'contained' : 'outlined'}
										onClick={() =>
											setPlacingTextIndex((prev) => (prev === index ? null : index))
										}>
										Set Pos
									</Button>
									<Button
										color='error'
										size='small'
										variant='outlined'
										onClick={() => {
											setPlacingTextIndex((prev) => {
												if (prev === null) return prev;
												if (prev === index) return null;
												return prev > index ? prev - 1 : prev;
											});
											setMapData((prev) => ({
												...prev,
												text: (prev.text ?? []).filter((_, i) => i !== index),
											}));
										}}>
										Remove
									</Button>
								</Stack>
							))}
							<Button
								size='small'
								variant='outlined'
								onClick={() => {
									setMapData((prev) => ({
										...prev,
										text: [...(prev.text ?? []), { x: 0.5, y: 0.5, text: 'Text' }],
									}));
								}}>
								Add Text
							</Button>
						</Stack>
					</Paper>
				</Stack>
			</Grid>
		</Fragment>
	);
}
