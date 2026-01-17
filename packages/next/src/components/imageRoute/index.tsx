import { useEffect, useRef, useState } from 'react';
import useBoundingClientRect from '../../hooks/useBoundingClientRect';
import useControlledState from '../../hooks/useControlledState';
import ImageRouteContainer from './imageRouteContainer';
import ImageRoutePaths from './imageRoutePaths';
import ImageRoutePoints from './imageRoutePoints';
import { type ImageRouteProps, type Spot } from './types';
import { calculateCenterZoom, getClosestPointOnPath } from './utils';

export default function ImageRoute({
	ref,
	points,
	addPoint,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	RenderPoint,
	RenderPath,
	RenderExtra,
	deps,
	getInitialPosition = () => ({ scale: 1, offset: { x: 0, y: 0 } }),
	getAnimatedPosition,
	followActiveSpot,
	sx,
	children,
	...props
}: ImageRouteProps) {
	const internalRef = useRef<HTMLDivElement>(null);
	const containerRef = ref ?? internalRef;
	const containerSize = useBoundingClientRect(containerRef);

	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

	const [isAnimating, setIsAnimating] = useState(false);

	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		if (!points || !containerSize?.width || !containerSize?.height) return;
		const { scale, offset } = getInitialPosition(containerSize);
		if (scale) setScale(scale);
		if (offset) setMapOffset(offset);
		setIsAnimating(false);

		if (!getAnimatedPosition) return;

		const animationFrame = requestAnimationFrame(() => {
			const { scale, offset } = getAnimatedPosition(containerSize);
			if (scale) setScale(scale);
			if (offset) setMapOffset(offset);
			setIsAnimating(true);
		});
		const timeout = setTimeout(() => setIsAnimating(false), 2000);

		return () => {
			cancelAnimationFrame(animationFrame);
			clearTimeout(timeout);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deps, Boolean(points)]);

	useEffect(() => {
		if (!followActiveSpot || !activeSpot || !containerSize?.width || !containerSize?.height)
			return;

		requestAnimationFrame(() => {
			const { offset } = calculateCenterZoom(activeSpot.point, containerSize, scale);
			setMapOffset(offset);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [followActiveSpot, activeSpot?.point.x, activeSpot?.point.y]);

	return (
		<ImageRouteContainer
			containerRef={containerRef}
			containerSize={containerSize}
			scale={scale}
			setScale={setScale}
			mapOffset={mapOffset}
			setMapOffset={setMapOffset}
			isAnimating={isAnimating}
			onHoverRoute={(point) => {
				if (addPoint) return;
				setHoverSpot(getClosestPointOnPath(points, point.x, point.y, 15 / containerSize.width));
			}}
			onClickRoute={(point) => {
				if (addPoint) return addPoint(point);
				if (hoverSpot) setActiveSpot(hoverSpot);
			}}
			sx={sx}
			{...props}>
			{children}
			{containerSize && (
				<svg style={{ width: '100%', height: '100%' }}>
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
