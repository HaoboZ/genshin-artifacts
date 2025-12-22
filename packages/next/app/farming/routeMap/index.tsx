'use client';
import useControlledState from '@/src/hooks/useControlledState';
import { Box, BoxProps, Button } from '@mui/material';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import RouteMapContainer from './routeMapContainer';
import RouteMapPaths from './routeMapPaths';
import RouteMapPoints from './routeMapPoints';
import { findSpotByTime, findTimeBySpot, Point, Spot } from './utils';

export default function RouteMap({
	src,
	points,
	setPoints,
	time: _time = 0,
	setTime: _setTime,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	sx,
	...props
}: {
	src: string;
	points: Point[];
	setPoints?: Dispatch<SetStateAction<Point[]>>;
	time?: number;
	setTime?: Dispatch<number>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
} & BoxProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const [containerSize, setContainerSize] = useState<DOMRect>(null);
	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

	const [time, setTime] = useControlledState(_time, _setTime);
	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	// sync activeSpot with time
	useEffect(() => {
		if (!containerSize) return;

		const spot = findSpotByTime(points, time);
		if (spot) {
			// convert normalized coordinates to pixel coordinates
			spot.point = {
				x: spot.point.x * containerSize.width,
				y: spot.point.y * containerSize.height,
			};
		}

		setActiveSpot(spot);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [time, containerSize]);

	return (
		<RouteMapContainer
			containerRef={containerRef}
			containerSize={containerSize}
			setContainerSize={setContainerSize}
			scale={scale}
			setScale={setScale}
			mapOffset={mapOffset}
			setMapOffset={setMapOffset}
			points={points}
			setPoints={setPoints}
			hoverSpot={hoverSpot}
			setHoverSpot={setHoverSpot}
			setActiveSpot={(spot) => {
				setActiveSpot(spot);

				const calculatedTime = findTimeBySpot(points, spot);
				if (calculatedTime !== null) {
					setTime(calculatedTime);
				}
			}}
			sx={sx}
			{...props}>
			<Button
				variant='contained'
				sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
				onClick={(e) => {
					e.stopPropagation();
					setScale(1);
					setMapOffset({ x: 0, y: 0 });
				}}>
				Reset View
			</Button>
			<Box
				sx={{
					transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${scale})`,
					transformOrigin: '0 0',
					width: '100%',
					height: '100%',
				}}>
				<Image fill alt={src} src={`/maps/${src}.png`} style={{ zIndex: -1 }} />
				{containerSize && (
					<svg style={{ overflow: 'visible', width: '100%', height: '100%' }}>
						<RouteMapPaths containerSize={containerSize} points={points} />
						<RouteMapPoints
							containerSize={containerSize}
							scale={scale}
							points={points}
							activeSpot={activeSpot}
							hoverSpot={hoverSpot}
						/>
					</svg>
				)}
			</Box>
		</RouteMapContainer>
	);
}
