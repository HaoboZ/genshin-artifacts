import { Box, type BoxProps } from '@mui/material';
import Image from 'next/image';
import { type ComponentType, type Dispatch, useEffect, useState } from 'react';
import useControlledState from '../../hooks/useControlledState';
import ImageRouteContainer from './imageRouteContainer';
import ImageRoutePaths from './imageRoutePaths';
import ImageRoutePoints from './imageRoutePoints';
import { type Point, type RenderPathProps, type RenderPointProps, type Spot } from './types';
import { calculateOptimalZoom } from './utils';

export default function ImageRoute({
	src,
	route = src,
	points,
	addPoint,
	hidePoints,
	onLoaded,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	RenderPoint,
	RenderPath,
	zoom,
	disableAnimations,
	sx,
	children,
	...props
}: {
	src: string;
	route?: string;
	points: Point[];
	addPoint?: Dispatch<Point>;
	hidePoints?: boolean;
	onLoaded?: () => void;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
	RenderPoint?: ComponentType<RenderPointProps>;
	RenderPath?: ComponentType<RenderPathProps>;
	zoom?: number;
	disableAnimations?: boolean;
} & BoxProps) {
	const [containerSize, setContainerSize] = useState<DOMRect>(null);
	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

	const [isLoading, setIsLoading] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);

	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		setIsLoading(true);
	}, [src]);

	useEffect(() => {
		setScale(1);
		setMapOffset({ x: 0, y: 0 });
		setActiveSpot(null);
		setIsAnimating(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [route]);

	useEffect(() => {
		if (isLoading || !points) return;

		const animId = requestAnimationFrame(() => {
			const { scale, offset } = calculateOptimalZoom(points, containerSize, zoom);
			setScale(scale);
			setMapOffset(offset);
			if (!disableAnimations) setIsAnimating(true);
			setIsLoading(false);
			onLoaded?.();
		});

		return () => cancelAnimationFrame(animId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, points]);

	return (
		<ImageRouteContainer
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
					position: 'relative',
					transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${scale})`,
					transformOrigin: '0 0',
					width: '100%',
					height: '100%',
					transition: isAnimating ? 'transform 1s ease' : 'none',
					transitionDelay: '1s',
				}}>
				<Image
					fill
					alt={src}
					src={`${process.env.NEXT_PUBLIC_BLOB_URL}/maps/${src}.png`}
					style={{ zIndex: -1, opacity: isLoading ? 0 : undefined }}
					onLoad={() => setIsLoading(false)}
				/>
				{containerSize && (
					<svg
						style={{
							display: isLoading ? 'none' : undefined,
							overflow: 'visible',
							width: '100%',
							height: '100%',
						}}>
						{children}
						<ImageRoutePaths
							containerSize={containerSize}
							points={points}
							RenderPath={RenderPath}
						/>
						<ImageRoutePoints
							containerSize={containerSize}
							scale={scale}
							points={points}
							hidePoints={hidePoints}
							activeSpot={activeSpot}
							hoverSpot={hoverSpot}
							RenderPoint={RenderPoint}
						/>
					</svg>
				)}
			</Box>
		</ImageRouteContainer>
	);
}
