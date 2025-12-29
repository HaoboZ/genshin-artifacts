import { Box, type BoxProps } from '@mui/material';
import { type Dispatch, useRef, useState } from 'react';
import { clamp } from 'remeda';
import useEventListener from '../../hooks/useEventListener';
import { type Point, type Spot } from './types';
import { clampPosition, getClosestPointOnPath } from './utils';

export default function ImageRouteContainer({
	containerSize,
	setContainerSize,
	scale,
	setScale,
	mapOffset,
	setMapOffset,
	points,
	snapPoint,
	setIsAnimating,
	hoverSpot,
	setHoverSpot,
	setActiveSpot,
	sx,
	...props
}: {
	containerSize: DOMRect;
	setContainerSize: Dispatch<DOMRect>;
	scale: number;
	setScale: Dispatch<number>;
	mapOffset: Point;
	setMapOffset: Dispatch<Point>;
	points: Point[];
	snapPoint?: boolean;
	setIsAnimating: Dispatch<boolean>;
	hoverSpot: Spot;
	setHoverSpot: Dispatch<Spot>;
	setActiveSpot: Dispatch<Spot>;
} & Omit<BoxProps, 'ref'>) {
	const containerRef = useRef<HTMLDivElement>(null);

	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'resize',
		() => setContainerSize(containerRef.current?.getBoundingClientRect()),
		true,
	);

	useEventListener(typeof window !== 'undefined' ? window : null, 'scroll', () =>
		setContainerSize(containerRef.current?.getBoundingClientRect()),
	);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(containerRef.current, 'wheel', (e) => {
		e.preventDefault();

		// Disable animation on wheel event
		setIsAnimating?.(false);

		// get mouse position relative to container
		const mouseX = e.clientX - containerSize.x;
		const mouseY = e.clientY - containerSize.y;

		// calculate mouse position relative to image before zoom
		const imageX = (mouseX - mapOffset.x) / scale;
		const imageY = (mouseY - mapOffset.y) / scale;

		// update scale with new bounds
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = clamp(scale * delta, { min: 1, max: 8 });

		// calculate new position to keep mouse point stable
		const newX = mouseX - imageX * newScale;
		const newY = mouseY - imageY * newScale;

		setScale(newScale);
		// clamp position to keep image within bounds
		setMapOffset(clampPosition(containerSize, newX, newY, newScale));
	});

	return (
		<Box
			ref={containerRef}
			sx={{
				position: 'relative',
				overflow: 'hidden',
				cursor: 'crosshair',
				...sx,
			}}
			onMouseDown={(e) => {
				// right mouse button
				if (e.button !== 2) return;
				e.preventDefault();
				setIsDragging(true);
				setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
			}}
			onMouseMove={(e) => {
				if (isDragging) {
					const newX = e.clientX - dragStart.x;
					const newY = e.clientY - dragStart.y;
					setMapOffset(clampPosition(containerSize, newX, newY, scale));
					return;
				}

				// show hover preview when addPoint is null
				if (!snapPoint || !containerSize) return;

				const mouseX =
					(e.clientX - containerSize.x - mapOffset.x) / scale / containerSize.width;
				const mouseY =
					(e.clientY - containerSize.y - mapOffset.y) / scale / containerSize.height;
				setHoverSpot(getClosestPointOnPath(points, mouseX, mouseY, 15 / containerSize.width));
			}}
			onMouseUp={() => setIsDragging(false)}
			onClick={(e) => {
				if (isDragging) return;

				if (snapPoint) {
					if (hoverSpot) setActiveSpot(hoverSpot);
					return;
				}

				const clickX = (e.clientX - containerSize.x - mapOffset.x) / scale;
				const clickY = (e.clientY - containerSize.y - mapOffset.y) / scale;

				const point: Point = {
					x: clickX / containerSize.width,
					y: clickY / containerSize.height,
					marked: 1,
				};

				// hold ctrl for non artifact point
				if (e.ctrlKey) delete point.marked;

				setActiveSpot({ point });
			}}
			onContextMenu={(e) => e.preventDefault()}
			{...props}
		/>
	);
}
