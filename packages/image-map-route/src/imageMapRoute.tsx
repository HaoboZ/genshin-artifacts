import { useEffect, useRef, useState } from 'react';
import useBoundingClientRect from './hooks/useBoundingClientRect';
import useControlledState from './hooks/useControlledState';
import ImageMapRouteContainer from './imageMapRouteContainer';
import ImageMapRoutePaths from './imageMapRoutePaths';
import ImageMapRoutePoints from './imageMapRoutePoints';
import { type ImageMapRouteProps, type Spot } from './types';
import { calculateCenterZoom } from './utils';
import { getClosestPointOnPath } from './utils/getClosestPointOnPath';
import { clampPosition } from './utils/clampPosition';
import { getContainedImageRect } from './utils/getContainedImageRect';

export default function ImageMapRoute({
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
	imageAspectRatio,
	followActiveSpot,
	children,
	...props
}: ImageMapRouteProps) {
	const internalRef = useRef<HTMLDivElement>(null);
	const containerRef = ref ?? internalRef;
	const containerSize = useBoundingClientRect(containerRef);
	const [detectedImageAspectRatio, setDetectedImageAspectRatio] = useState<number>();
	const resolvedImageAspectRatio = imageAspectRatio ?? detectedImageAspectRatio;
	const imageSize =
		containerSize && getContainedImageRect(containerSize, resolvedImageAspectRatio);

	const [scale, setScale] = useState(1);
	const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

	const [isAnimating, setIsAnimating] = useState(false);

	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);
	const [hoverSpot, setHoverSpot] = useState<Spot>(null);

	useEffect(() => {
		if (imageAspectRatio) return;

		const image = containerRef.current?.querySelector('img');
		if (!image) return;

		const updateImageAspectRatio = () => {
			if (image.naturalWidth && image.naturalHeight) {
				setDetectedImageAspectRatio(image.naturalWidth / image.naturalHeight);
			}
		};

		updateImageAspectRatio();
		image.addEventListener('load', updateImageAspectRatio);
		return () => image.removeEventListener('load', updateImageAspectRatio);
	}, [children, containerRef, imageAspectRatio]);

	useEffect(() => {
		if (!points || !containerSize?.width || !containerSize?.height) return;
		const { scale, offset } = getInitialPosition(imageSize);
		if (scale) setScale(scale);
		if (offset)
			setMapOffset(clampPosition(containerSize, offset.x, offset.y, scale ?? 1, imageSize));
		setIsAnimating(false);

		if (!getAnimatedPosition) return;

		const animationFrame = setTimeout(() => {
			const { scale, offset } = getAnimatedPosition(imageSize);
			if (scale) setScale(scale);
			if (offset)
				setMapOffset(clampPosition(containerSize, offset.x, offset.y, scale ?? 1, imageSize));
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 2000);
		}, 1000);

		return () => clearTimeout(animationFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deps, Boolean(points), imageSize?.width, imageSize?.height]);

	useEffect(() => {
		if (
			!followActiveSpot ||
			!activeSpot?.point ||
			!containerSize?.width ||
			!containerSize?.height
		)
			return;

		requestAnimationFrame(() => {
			const { offset } = calculateCenterZoom(activeSpot.point, imageSize, scale);
			setMapOffset(clampPosition(containerSize, offset.x, offset.y, scale, imageSize));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [followActiveSpot, activeSpot?.point, imageSize?.width, imageSize?.height, scale]);

	return (
		<ImageMapRouteContainer
			containerRef={containerRef}
			containerSize={containerSize}
			imageSize={imageSize}
			scale={scale}
			setScale={setScale}
			mapOffset={mapOffset}
			setMapOffset={setMapOffset}
			isAnimating={isAnimating}
			onHoverRoute={(point) => {
				if (addPoint) return;
				setHoverSpot(getClosestPointOnPath(points, point.x, point.y, 15 / imageSize.width));
			}}
			onClickRoute={(point) => {
				if (addPoint) return addPoint(point);
				if (hoverSpot) setActiveSpot(hoverSpot);
			}}
			{...props}>
			{children}
			{imageSize && (
				<svg
					style={{
						position: 'absolute',
						left: imageSize.x,
						top: imageSize.y,
						width: imageSize.width,
						height: imageSize.height,
					}}>
					<ImageMapRoutePaths
						containerSize={imageSize}
						scale={scale}
						points={points}
						RenderPath={RenderPath}
					/>
					<ImageMapRoutePoints
						containerSize={imageSize}
						scale={scale}
						points={points}
						activeSpot={activeSpot}
						hoverSpot={hoverSpot}
						RenderPoint={RenderPoint}
					/>
					{RenderExtra && (
						<RenderExtra containerSize={imageSize} scale={scale} points={points} />
					)}
				</svg>
			)}
		</ImageMapRouteContainer>
	);
}
