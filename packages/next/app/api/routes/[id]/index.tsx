'use client';

import ImageRoute from '@/components/imageRoute';
import { type Point } from '@/components/imageRoute/types';
import RatioContainer from '@/components/ratioContainer';
import { Edit as EditIcon, EditLocationAlt as EditLocationAltIcon } from '@mui/icons-material';
import {
	Container,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { filter, groupBy, map, pipe, prop, sortBy } from 'remeda';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { MapRenderExtra, MapRenderPoint } from '../../../farming/render';
import { type MapData, type RouteData } from '../types';
import RouteControls from './controls';

const MapMetadataModal = dynamicModal(() => import('../../maps/mapMetadataModal'));

function pointKey(x?: number, y?: number) {
	if (x === undefined || y === undefined) return '';
	return `${x}:${y}`;
}

export default function Route({ routeData }: { routeData: RouteData }) {
	const router = useRouter();
	const { showModal } = useModal();
	const [routeMaps, setRouteMaps] = useState<string[]>(routeData.maps);
	const [editingMap, setEditingMap] = useState('');
	const [activeKey, setActiveKey] = useState('');
	const mapsData = routeData.mapsData || [];

	const groupedPoints = useMemo(() => {
		return pipe(
			mapsData,
			filter((item) => item.x !== undefined && item.y !== undefined),
			groupBy((item) => pointKey(item.x, item.y)),
			Object.entries,
			filter(([key]) => Boolean(key)),
			sortBy(([key]) => key),
			map(([key, maps]) => {
				const [x, y] = key.split(':').map(Number);
				return { key, x, y, maps };
			}),
		);
	}, [mapsData]);

	const points = useMemo(
		() =>
			groupedPoints.map((item, index) => ({ x: item.x, y: item.y, marked: index + 1 }) as Point),
		[groupedPoints],
	);

	const selectedMaps = useMemo(() => {
		if (!activeKey) return [];
		return pipe(
			mapsData,
			filter((item) => pointKey(item.x, item.y) === activeKey),
			sortBy((item) => {
				const index = routeMaps.indexOf(item.id);
				return index === -1 ? Infinity : index;
			}, prop('name')),
		);
	}, [activeKey, mapsData, routeMaps]);

	return (
		<Container sx={{ pt: 1 }}>
			<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
				<RouteControls routeData={routeData} maps={routeMaps} />
				<Grid size={12} container>
					<Grid size={8} sx={{ height: 'calc(100vh - 56px)' }}>
						<RatioContainer width={16} height={9}>
							<ImageRoute
								points={points}
								addPoint={
									editingMap
										? async (point) => {
												const mapData = mapsData.find(({ id }) => id === editingMap);
												await axios.post(
													`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${editingMap}.json`,
													{ ...mapData, x: point.x, y: point.y },
													{
														headers: {
															Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}`,
														},
													},
												);
												setEditingMap('');
												window.location.reload();
											}
										: undefined
								}
								setActiveSpot={(spot) => {
									if (!spot?.point) return;
									setActiveKey(pointKey(spot.point.x, spot.point.y));
								}}
								RenderPoint={MapRenderPoint}
								RenderPath={() => null}
								RenderExtra={MapRenderExtra}
								sx={{ width: '100%', height: '100%', opacity: points ? 1 : 0 }}>
								<Image
									fill
									alt='teyvat'
									src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
									style={{ zIndex: -1, objectFit: 'contain' }}
								/>
							</ImageRoute>
						</RatioContainer>
					</Grid>
					<Grid size={4}>
						<Paper sx={{ width: '100%' }}>
							<Typography sx={{ p: 1 }} variant='h6'>
								{activeKey ? 'Maps at selected point' : 'Select a point on Teyvat'}
							</Typography>
							<List sx={{ height: 'calc(100vh - 104px)', overflow: 'auto' }}>
								{selectedMaps.map((item) => {
									const index = routeMaps.indexOf(item.id);

									return (
										<ListItem
											key={item.id}
											secondaryAction={
												<Stack direction='row'>
													<IconButton onClick={() => setEditingMap(item.id)}>
														<EditLocationAltIcon />
													</IconButton>
													<IconButton
														onClick={() => {
															showModal(MapMetadataModal, {
																props: {
																	mapData: item as MapData,
																	onSaved: () => router.refresh(),
																},
															});
														}}>
														<EditIcon />
													</IconButton>
												</Stack>
											}
											disablePadding>
											<ListItemButton
												selected={editingMap === item.id}
												onClick={() => {
													if (index === -1) {
														setRouteMaps((data) => [...data, item.id]);
													} else {
														setRouteMaps((data) =>
															data.filter((id) => id !== item.id),
														);
													}
												}}>
												<ListItemText
													secondary={`Order: ${index === -1 ? '-' : index + 1} • Spots: ${item.spots ?? 0}`}>
													{item.name}
												</ListItemText>
											</ListItemButton>
										</ListItem>
									);
								})}
							</List>
						</Paper>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
}
