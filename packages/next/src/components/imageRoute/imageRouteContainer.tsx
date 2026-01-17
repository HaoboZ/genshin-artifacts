import { Box, type BoxProps } from '@mui/material';
import { type Dispatch, type ReactNode, type RefObject, type TouchList, useRef } from 'react';
import { clamp } from 'remeda';
import useEventListener from '../../hooks/useEventListener';
import { type Point } from './types';
import { clampPosition, mouseToContainer } from './utils';

export default function ImageRouteContainer({
	containerRef,
	containerSize,
	scale,
	setScale,
	mapOffset,
	setMapOffset,
	isAnimating,
	onHoverRoute,
	onClickRoute,
	sx,
	children,
	...props
}: {
	containerRef: RefObject<HTMLDivElement>;
	containerSize: DOMRect;
	scale: number;
	setScale: Dispatch<number>;
	mapOffset: Point;
	setMapOffset: Dispatch<Point>;
	isAnimating: boolean;
	onHoverRoute?: (point: { x: number; y: number }) => void;
	onClickRoute?: (point: { x: number; y: number }) => void;
	innerChildren?: ReactNode;
} & Omit<BoxProps, 'ref'>) {
	const isDragging = useRef(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const lastTouchDistance = useRef<number>(null);
	const touchStartTime = useRef<number>(0);
	const interactionStartPos = useRef<Point>(null);

	const startDrag = (clientX: number, clientY: number) => {
		isDragging.current = true;
		interactionStartPos.current = { x: clientX, y: clientY };
		dragStart.current = { x: clientX - mapOffset.x, y: clientY - mapOffset.y };
		touchStartTime.current = Date.now();
	};

	const performDrag = (clientX: number, clientY: number) => {
		if (!containerSize) return;
		const newX = clientX - dragStart.current.x;
		const newY = clientY - dragStart.current.y;
		setMapOffset(clampPosition(containerSize, newX, newY, scale));
	};

	const performZoom = (zoomCenter: Point, scaleDelta: number) => {
		if (!containerSize) return;

		const newScale = clamp(scale * scaleDelta, { min: 1, max: 16 }) || 1;

		const mouseX = zoomCenter.x - containerSize.left;
		const mouseY = zoomCenter.y - containerSize.top;
		const centerX = containerSize.width / 2;
		const centerY = containerSize.height / 2;
		const imagePointX = (mouseX - centerX - mapOffset.x) / scale;
		const imagePointY = (mouseY - centerY - mapOffset.y) / scale;
		const newX = mouseX - centerX - imagePointX * newScale;
		const newY = mouseY - centerY - imagePointY * newScale;

		setScale(newScale);
		setMapOffset(clampPosition(containerSize, newX, newY, newScale));
	};

	const handleClick = (click: { x: number; y: number }) => {
		if (!containerSize) return;

		const centerX = containerSize.width / 2;
		const centerY = containerSize.height / 2;
		const containerPoint = {
			x: (click.x - containerSize.x - centerX - mapOffset.x) / scale,
			y: (click.y - containerSize.y - centerY - mapOffset.y) / scale,
		};
		onClickRoute?.(containerPoint);
	};

	const endDrag = () => {
		isDragging.current = false;
		lastTouchDistance.current = null;
		interactionStartPos.current = null;
	};

	const getTouchDistance = (touches: TouchList) => {
		if (touches.length < 2) return null;
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const getTouchCenter = (touches: TouchList) => {
		if (touches.length < 2) return null;
		return {
			x: (touches[0].clientX + touches[1].clientX) / 2,
			y: (touches[0].clientY + touches[1].clientY) / 2,
		};
	};

	// eslint-disable-next-line react-hooks/refs
	useEventListener(containerRef.current, 'wheel', (e) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		performZoom({ x: e.clientX, y: e.clientY }, delta);
	});

	return (
		<Box
			ref={containerRef}
			sx={{
				overflow: 'hidden',
				cursor: 'crosshair',
				touchAction: 'none',
				bgcolor: 'black',
				...sx,
			}}
			onMouseDown={(e) => {
				if (e.button !== 2) return;
				e.preventDefault();
				startDrag(e.clientX, e.clientY);
			}}
			onMouseMove={(e) => {
				if (isDragging.current) {
					performDrag(e.clientX, e.clientY);
					return;
				}

				if (!containerSize) return;
				onHoverRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
			}}
			onMouseUp={endDrag}
			onClick={(e) => {
				if (isDragging.current || !containerSize) return;
				onClickRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
			}}
			onContextMenu={(e) => e.preventDefault()}
			onTouchStart={(e) => {
				if (e.touches.length === 1) {
					const touch = e.touches[0];
					startDrag(touch.clientX, touch.clientY);
				} else if (e.touches.length === 2) {
					lastTouchDistance.current = getTouchDistance(e.touches);
				}
			}}
			onTouchMove={(e) => {
				e.preventDefault();

				if (e.touches.length === 1) {
					const touch = e.touches[0];
					performDrag(touch.clientX, touch.clientY);
				} else if (e.touches.length === 2) {
					const distance = getTouchDistance(e.touches);
					const center = getTouchCenter(e.touches);

					if (distance && center && lastTouchDistance.current) {
						const scaleDelta = distance / lastTouchDistance.current;
						performZoom(center, scaleDelta);
						lastTouchDistance.current = distance;
					}
				}
			}}
			onTouchEnd={(e) => {
				if (e.touches.length === 0) {
					const touchDuration = Date.now() - touchStartTime.current;
					const wasTap = touchDuration < 200 && !isDragging.current;

					if (wasTap && interactionStartPos.current) {
						handleClick(interactionStartPos.current);
					}

					endDrag();
				} else if (e.touches.length === 1) {
					lastTouchDistance.current = null;
				}
			}}
			{...props}>
			<Box
				sx={{
					position: 'relative',
					transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${scale})`,
					transformOrigin: '50% 50%',
					width: '100%',
					height: '100%',
					transition: isAnimating ? 'transform 1s ease' : 'none',
					transitionDelay: '1s',
				}}>
				{children}
			</Box>
		</Box>
	);
}
