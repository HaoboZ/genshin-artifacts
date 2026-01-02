import { useEffect, useRef, useState } from 'react';
import useBoundingClientRect from '../../hooks/useBoundingClientRect';
import useControlledState from '../../hooks/useControlledState';
import ImageRouteContainer from './imageRouteContainer';
import ImageRoutePaths from './imageRoutePaths';
import ImageRoutePoints from './imageRoutePoints';
import { type ImageRouteProps, type Spot } from './types';
import { calculateOptimalZoom, getClosestPointOnPath } from './utils';

export default function ImageRoute({
	points,
	addPoint,
	hidePoints,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	RenderPoint,
	RenderPath,
	RenderExtra,
	initialZoom,
	disableAnimations,
	sx,
	children,
	...props
}: ImageRouteProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useBoundingClientRect(containerRef);

	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

	const [isAnimating, setIsAnimating] = useState(false);

	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		setScale(1);
		setMapOffset({ x: 0, y: 0 });
		setActiveSpot(null);
		setIsAnimating(false);

		const animationFrame = requestAnimationFrame(() => {
			const { scale, offset } = calculateOptimalZoom(points, containerSize, initialZoom);
			setScale(scale);
			setMapOffset(offset);
			if (!disableAnimations) setIsAnimating(true);
		});

		return () => cancelAnimationFrame(animationFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Boolean(points)]);

	return (
		<ImageRouteContainer
			containerRef={containerRef}
			containerSize={containerSize}
			scale={scale}
			setScale={setScale}
			mapOffset={mapOffset}
			setMapOffset={setMapOffset}
			isAnimating={isAnimating}
			setIsAnimating={setIsAnimating}
			onHoverRoute={(point) => {
				if (addPoint) return;
				setHoverSpot(getClosestPointOnPath(points, point.x, point.y, 15 / containerSize.width));
			}}
			onClickRoute={(point) => {
				if (addPoint) {
					addPoint(point);
					return;
				}
				if (hoverSpot) setActiveSpot(hoverSpot);
			}}
			sx={sx}
			{...props}>
			{children}
			{containerSize && (
				<svg style={{ overflow: 'visible', width: '100%', height: '100%' }}>
					<ImageRoutePaths
						containerSize={containerSize}
						scale={scale}
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
					{RenderExtra && (
						<RenderExtra containerSize={containerSize} scale={scale} points={points} />
					)}
				</svg>
			)}
		</ImageRouteContainer>
	);
}
