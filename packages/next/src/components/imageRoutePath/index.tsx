import { Box, type BoxProps } from '@mui/material';
import Image from 'next/image';
import { type Dispatch, useEffect, useState } from 'react';
import useControlledState from '../../hooks/useControlledState';
import ImageRoutePathContainer from './imageRoutePathContainer';
import ImageRoutePathPaths from './imageRoutePathPaths';
import ImageRoutePathPoints from './imageRoutePathPoints';
import { type Point, type Spot } from './types';
import { calculateOptimalZoom } from './utils';

export default function ImageRoutePath({
	src,
	points,
	addPoint,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	disableAnimations,
	sx,
	...props
}: {
	src: string;
	points: Point[];
	addPoint?: Dispatch<Point>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
	disableAnimations?: boolean;
} & BoxProps) {
	const [containerSize, setContainerSize] = useState<DOMRect>(null);
	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
	const [isLoading, setIsLoading] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		setScale(1);
		setMapOffset({ x: 0, y: 0 });
		setActiveSpot(null);
		setIsAnimating(false);
		setIsLoading(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [src]);

	useEffect(() => {
		if (!isLoading || !points) return;

		const animId = requestAnimationFrame(() => {
			const { scale, offset } = calculateOptimalZoom(points, containerSize);
			setScale(scale);
			setMapOffset(offset);
			setIsAnimating(true);
			setIsLoading(false);
		});

		return () => cancelAnimationFrame(animId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, points]);

	return (
		<ImageRoutePathContainer
			containerSize={containerSize}
			setContainerSize={setContainerSize}
			scale={scale}
			setScale={setScale}
			mapOffset={mapOffset}
			setMapOffset={setMapOffset}
			points={points}
			snapPoint={!addPoint}
			setIsAnimating={setIsAnimating}
			hoverSpot={hoverSpot}
			setHoverSpot={setHoverSpot}
			setActiveSpot={(spot) => {
				if (addPoint) {
					addPoint(spot.point);
					setActiveSpot(null);
				} else {
					setActiveSpot(spot);
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
					transition: !disableAnimations && isAnimating ? 'transform 1s ease' : 'none',
					transitionDelay: '1s',
				}}>
				{!isLoading && <Image fill alt={src} src={`/maps/${src}.png`} style={{ zIndex: -1 }} />}
				{containerSize && (
					<svg style={{ overflow: 'visible', width: '100%', height: '100%' }}>
						<ImageRoutePathPaths containerSize={containerSize} points={points} />
						<ImageRoutePathPoints
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
		</ImageRoutePathContainer>
	);
}
