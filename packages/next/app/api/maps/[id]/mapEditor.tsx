import FormattedTextField from '@/components/formattedTextField';
import VideoPlayer from '@/components/videoPlayer';
import useHistory from '@/hooks/useHistory';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Grid,
	List,
	ListItem,
	ListItemButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import {
	ImageMapRoute,
	type Point,
	type Spot,
	useRouteVideoSync,
	useRouteYoutubeSync,
} from 'image-map-route';
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
import { type MapData, type Text } from '../../routes/types';

function extractYoutubeVideoId(url: string) {
	const parsed = new URL(url);
	if (parsed.hostname === 'youtu.be') {
		return parsed.pathname.replace('/', '');
	}
	if (parsed.hostname.endsWith('youtube.com')) {
		if (parsed.pathname.startsWith('/embed/')) {
			return parsed.pathname.replace('/embed/', '');
		}
		return parsed.searchParams.get('v');
	}
	return null;
}

declare global {
	interface Window {
		YT?: {
			Player?: new (elementId: string, options: unknown) => unknown;
		};
		onYouTubeIframeAPIReady?: () => void;
	}
}

export default function MapEditor({
	mapData,
	text,
	setText,
	points,
	setPoints,
}: {
	mapData: MapData;
	text: Text[];
	setText: Dispatch<SetStateAction<Text[]>>;
	points: Point[];
	setPoints: Dispatch<SetStateAction<Point[]>>;
}) {
	const [selectedPointIndex, setSelectedPointIndex] = useState(0);
	const [placingTextIndex, setPlacingTextIndex] = useState<number>(null);
	const [isShiftPressed, setIsShiftPressed] = useState(false);
	const [isCtrlPressed, setIsCtrlPressed] = useState(false);

	const videoSync = useRouteVideoSync(points);
	const youtubeSync = useRouteYoutubeSync(points);
	const isYoutubeVideo = Boolean(mapData.video?.startsWith('https'));

	const { routeRef, time, setTime, activeSpot, setActiveSpot } = isYoutubeVideo
		? youtubeSync
		: videoSync;

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
			const target = e.target as HTMLElement;
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

	const resolveAssetUrl = (value?: string) => {
		if (!value) return undefined;
		if (value.startsWith('http') || value.startsWith('blob:') || value.startsWith('data:')) {
			return value;
		}
		return `${process.env.NEXT_PUBLIC_ROUTE_URL}/assets/${value}`;
	};

	useEffect(() => {
		if (!isYoutubeVideo || !mapData.video) return;

		const videoId = extractYoutubeVideoId(mapData.video);
		if (!videoId) return;

		const createPlayer = () => {
			new window.YT.Player('map-editor-yt-player', {
				height: 'auto',
				width: '100%',
				videoId,
				events: {
					onReady: youtubeSync.onPlayerReady,
					onStateChange: youtubeSync.onPlayerStateChange,
				},
			});
		};

		if (window.YT?.Player) return createPlayer();

		const existingScript = document.querySelector(
			'script[src="https://www.youtube.com/iframe_api"]',
		);
		if (!existingScript) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			document.body.appendChild(tag);
		}

		window.onYouTubeIframeAPIReady = createPlayer;
	}, [isYoutubeVideo, mapData.video, youtubeSync.onPlayerReady, youtubeSync.onPlayerStateChange]);

	return (
		<Fragment>
			<Grid size={{ xs: 12, sm: 6 }}>
				<Accordion defaultExpanded sx={{ display: mapData.video ? undefined : 'none' }}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						slotProps={{ content: { component: 'h3' } }}>
						Video: {time.toFixed(2)}s
					</AccordionSummary>
					<AccordionDetails>
						{isYoutubeVideo ? (
							<div id='map-editor-yt-player' style={{ aspectRatio: '16 / 9' }} />
						) : (
							<VideoPlayer
								ref={videoSync.videoRef}
								src={resolveAssetUrl(mapData.video)}
								seekFrames={1}
							/>
						)}
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded sx={{ display: mapData.image ? undefined : 'none' }}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						slotProps={{ content: { component: 'h3' } }}>
						Image
					</AccordionSummary>
					<AccordionDetails>
						<Typography variant='subtitle2' sx={{ mb: 1 }}>
							{placingTextIndex !== null
								? `Click map to set text #${placingTextIndex + 1} position`
								: 'Click: add | Shift + Click: insert | Ctrl + Click: move'}
						</Typography>
						<ImageMapRoute
							ref={routeRef}
							points={mappedPoints}
							addPoint={(point: Point) => {
								const newPoint = pick(point, ['x', 'y']);
								if (placingTextIndex !== null) {
									setText((prev) => {
										if (!prev[placingTextIndex]) return prev;
										const next = [...prev];
										next[placingTextIndex] = {
											...next[placingTextIndex],
											...newPoint,
										};
										return next;
									});
									setPlacingTextIndex(null);
									return;
								}
								setPoints((prev) => {
									if (isCtrlPressed) {
										if (!selectedPoint) return;
										const newPoints = [...prev];
										newPoints[selectedPointIndex] = { ...selectedPoint, ...newPoint };
										return newPoints;
									}
									if (isShiftPressed) {
										if (!selectedPoint) return;
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
							RenderExtra={RouteRenderExtra(text)}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								alt={mapData.name}
								src={resolveAssetUrl(mapData.image)}
								style={{ width: '100%', objectFit: 'contain', pointerEvents: 'none' }}
							/>
						</ImageMapRoute>
					</AccordionDetails>
				</Accordion>
			</Grid>
			<Grid size={{ xs: 12, sm: 6 }}>
				<Accordion defaultExpanded>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						slotProps={{ content: { component: 'h3' } }}>
						Point Editor
					</AccordionSummary>
					<AccordionDetails>
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
										onClick={() => updateSelectedPoint('start', time)}>
										Set
									</Button>
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
								<Grid size={6}>
									<Button
										size='small'
										variant='outlined'
										fullWidth
										onClick={() => {
											if (!selectedPoint) return;
											const duplicateIndex = selectedPointIndex + 1;
											setPoints((prev) => [
												...prev.slice(0, duplicateIndex),
												{ ...selectedPoint },
												...prev.slice(duplicateIndex),
											]);
											setSelectedPointIndex(duplicateIndex);
										}}>
										Duplicate Point
									</Button>
								</Grid>
								<Grid size={6}>
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
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						slotProps={{ content: { component: 'h3' } }}>
						Points: {points.length}, Marked: {markedCount}
					</AccordionSummary>
					<AccordionDetails>
						<List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
							{points.map((point, index) => {
								const time = point.marked ?? point.start ?? point.end;

								return (
									<ListItem
										key={index}
										sx={{ p: 0 }}
										secondaryAction={
											<Button
												size='small'
												variant='outlined'
												disabled={time === undefined}
												onClick={() => setTime(time)}>
												Go
											</Button>
										}>
										<ListItemButton
											selected={selectedPointIndex === index}
											onClick={() => setSelectedPointIndex(index)}>
											#{index + 1}{' '}
											{point.start !== undefined ? `${point.start.toFixed(2)}s` : '―'} →{' '}
											{point.marked !== undefined ? `${point.marked.toFixed(2)}s` : '―'}{' '}
											→ {point.end !== undefined ? `${point.end.toFixed(2)}s` : '―'}
										</ListItemButton>
									</ListItem>
								);
							})}
						</List>
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						slotProps={{ content: { component: 'h3' } }}>
						Image Text
					</AccordionSummary>
					<AccordionDetails>
						<Stack spacing={1}>
							{text?.map((item, index) => (
								<Stack key={index} direction='row' spacing={1}>
									<TextField
										size='small'
										label={`Text ${index + 1}`}
										value={item.text}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											setText((prev) => {
												if (!prev[index]) return prev;
												const next = [...prev];
												next[index] = {
													...next[index],
													text: e.target.value,
												};
												return next;
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
											setText((prev) => {
												if (!prev[index]) return prev;
												const next = [...prev];
												next[index] = {
													...next[index],
													fontSize: e.target.value
														? +e.target.value / 1000
														: undefined,
												};
												return next;
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
											setText((prev) => prev.filter((_, i) => i !== index));
										}}>
										Remove
									</Button>
								</Stack>
							))}
							<Button
								size='small'
								variant='outlined'
								onClick={() => {
									setText((prev) => [...(prev ?? []), { x: 0.5, y: 0.5, text: 'Text' }]);
								}}>
								Add Text
							</Button>
						</Stack>
					</AccordionDetails>
				</Accordion>
			</Grid>
		</Fragment>
	);
}
