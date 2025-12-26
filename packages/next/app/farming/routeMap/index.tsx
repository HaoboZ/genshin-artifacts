'use client';
import useControlledState from '@/src/hooks/useControlledState';
import { Box, type BoxProps } from '@mui/material';
import Image from 'next/image';
import { type Dispatch, useEffect, useRef, useState } from 'react';
import RouteMapContainer from './routeMapContainer';
import RouteMapPaths from './routeMapPaths';
import RouteMapPoints from './routeMapPoints';
import {
	calculateOptimalZoom,
	findSpotByTime,
	findTimeBySpot,
	type Point,
	type Spot,
} from './utils';

export default function RouteMap({
	src,
	points,
	addPoint,
	time: _time = 0,
	setTime: _setTime,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	sx,
	...props
}: {
	src: string;
	points: Point[];
	addPoint?: Dispatch<Point>;
	time?: number;
	setTime?: Dispatch<number>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
} & BoxProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const [containerSize, setContainerSize] = useState<DOMRect>(null);
	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
	const [isLoading, setIsLoading] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const [time, setTime] = useControlledState(_time, _setTime);
	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		setScale(1);
		setMapOffset({ x: 0, y: 0 });
		setActiveSpot(null);
		setIsAnimating(false);
		setIsLoading(true);
	}, [src]);

	useEffect(() => {
		if (!isLoading || !points?.length) return;

		const animId = requestAnimationFrame(() => {
			const { scale, offset } = calculateOptimalZoom(points, containerSize);

			setIsAnimating(true);
			setScale(scale);
			setMapOffset(offset);
			setIsLoading(false);
		});

		return () => cancelAnimationFrame(animId);
	}, [isLoading, points]);

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
			addPoint={addPoint}
			setIsAnimating={setIsAnimating}
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
			<Box
				sx={{
					transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${scale})`,
					transformOrigin: '0 0',
					width: '100%',
					height: '100%',
					transition: isAnimating ? 'transform 1s ease' : 'none',
					transitionDelay: '1s',
				}}>
				{!isLoading && <Image fill alt={src} src={`/maps/${src}.png`} style={{ zIndex: -1 }} />}
				{containerSize && (
					<svg style={{ overflow: 'visible', width: '100%', height: '100%' }}>
						<RouteMapPaths containerSize={containerSize} points={points} />
						<RouteMapPoints
							containerSize={containerSize}
							scale={scale}
							points={points}
							showPoints={Boolean(_setActiveSpot)}
							activeSpot={activeSpot}
							hoverSpot={hoverSpot}
						/>
					</svg>
				)}
			</Box>
		</RouteMapContainer>
	);
}
