'use client';

import ImageRoute from '@/components/imageRoute';
import { type Point } from '@/components/imageRoute/types';
import { calculateOptimalZoom } from '@/components/imageRoute/utils';
import RatioContainer from '@/components/ratioContainer';
import useFetchState from '@/hooks/useFetchState';
import {
	AddLocationAlt as AddLocationAltIcon,
	EditLocationAlt as EditLocationAltIcon,
} from '@mui/icons-material';
import {
	Container,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { filter, map, pick, pipe, prop, sortBy } from 'remeda';
import { MapRenderExtra, MapRenderPath, MapRenderPoint } from '../../../farming/render';
import { type MapData, type RouteData } from '../types';
import RouteControls from './controls';

export default function Route({ routeData }: { routeData: RouteData }) {
	const [routeMaps, setRouteMaps] = useState<string[]>(routeData.maps);
	const [search, setSearch] = useState('');
	const [owner, setOwner] = useState('');
	const [editingMap, setEditingMap] = useState('');

	const [mapsData, setMapsData] = useFetchState<MapData[]>(
		`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps.json`,
	);

	const filteredItems = useMemo(() => {
		if (!mapsData) return [];

		return pipe(
			mapsData,
			filter((item) => {
				if (
					search &&
					!item.name.toLowerCase().includes(search) &&
					!item.background?.toLowerCase().includes(search)
				) {
					return false;
				}
				return owner ? item.owner === owner : true;
			}),
			sortBy((item) => {
				const index = routeMaps.indexOf(item.id);
				return index === -1 ? Infinity : index;
			}, prop('name')),
		);
	}, [mapsData, routeMaps, search, owner]);

	const points = useMemo(() => {
		return pipe(
			routeData.mapsData,
			filter(({ x, y }) => x !== undefined && y !== undefined),
			map((data, index) => ({ ...pick(data, ['x', 'y', 'type']), marked: index + 1 })),
		) as Point[];
	}, [routeData]);

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
												await axios.post(
													`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${editingMap}.json`,
													{
														...mapsData.find(({ id }) => id === editingMap),
														...pick(point, ['x', 'y']),
													},
													{
														headers: {
															Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}`,
														},
													},
												);
												setEditingMap('');
												setMapsData((mapData) => {
													const found = mapData.find(({ id }) => id === editingMap);
													found.x = point.x;
													found.y = point.y;
													return [...mapData];
												});
											}
										: undefined
								}
								RenderPoint={MapRenderPoint}
								RenderPath={MapRenderPath}
								RenderExtra={MapRenderExtra}
								getInitialPosition={(containerSize) =>
									calculateOptimalZoom(points, containerSize, 0.9)
								}
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
						<Grid container spacing={1} sx={{ justifyContent: 'center' }}>
							<Grid size={6}>
								<TextField
									label='Filter'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</Grid>
							<Grid size={6}>
								<TextField
									label='Owner'
									value={owner}
									onChange={(e) => setOwner(e.target.value)}
								/>
							</Grid>
							<Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
								{filteredItems.length ? (
									<Paper sx={{ width: '100%' }}>
										<List sx={{ height: 'calc(100vh - 104px)', overflow: 'auto' }}>
											{filteredItems.map((item) => {
												const index = routeMaps.indexOf(item.id);

												return (
													<ListItem
														key={item.id}
														dense
														secondaryAction={
															<IconButton onClick={() => setEditingMap(item.id)}>
																{item.x ? (
																	<EditLocationAltIcon />
																) : (
																	<AddLocationAltIcon />
																)}
															</IconButton>
														}
														disablePadding>
														<ListItemButton
															selected={editingMap === item.id}
															onClick={() => {
																if (!item.x) setEditingMap(item.id);

																if (index === -1) {
																	setRouteMaps((routeMaps) => [
																		...routeMaps,
																		item.id,
																	]);
																} else {
																	setRouteMaps((routeMaps) =>
																		routeMaps.filter((id) => id !== item.id),
																	);
																}
															}}>
															<ListItemIcon>
																{index === -1 ? '' : index + 1}
															</ListItemIcon>
															<ListItemText secondary={`Spots: ${item.spots ?? 0}`}>
																{item.name}
															</ListItemText>
														</ListItemButton>
													</ListItem>
												);
											})}
										</List>
									</Paper>
								) : (
									<Typography>No Items Found</Typography>
								)}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
}
