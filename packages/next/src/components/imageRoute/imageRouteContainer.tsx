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

		// calculate mouse position relative to image center before zoom
		const centerX = containerSize.width / 2;
		const centerY = containerSize.height / 2;
		const imageX = (mouseX - centerX - mapOffset.x) / scale;
		const imageY = (mouseY - centerY - mapOffset.y) / scale;

		// update scale with new bounds
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = clamp(scale * delta, { min: 1, max: 8 });

		// calculate new position to keep mouse point stable
		const newX = mouseX - centerX - imageX * newScale;
		const newY = mouseY - centerY - imageY * newScale;

		setScale(newScale);
		// clamp position to keep image within bounds
		setMapOffset(clampPosition(containerSize, newX, newY, newScale));
	});

	return (
		<Box
			ref={containerRef}
			sx={{ overflow: 'hidden', cursor: 'crosshair', ...sx }}
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

				const centerX = containerSize.width / 2;
				const centerY = containerSize.height / 2;
				const mouseX = (e.clientX - containerSize.x - centerX - mapOffset.x) / scale;
				const mouseY = (e.clientY - containerSize.y - centerY - mapOffset.y) / scale;
				const normalizedX = (mouseX + centerX) / containerSize.width;
				const normalizedY = (mouseY + centerY) / containerSize.height;
				setHoverSpot(
					getClosestPointOnPath(points, normalizedX, normalizedY, 15 / containerSize.width),
				);
			}}
			onMouseUp={() => setIsDragging(false)}
			onClick={(e) => {
				if (isDragging) return;

				if (snapPoint) {
					if (hoverSpot) setActiveSpot(hoverSpot);
					return;
				}

				const centerX = containerSize.width / 2;
				const centerY = containerSize.height / 2;
				const clickX = (e.clientX - containerSize.x - centerX - mapOffset.x) / scale;
				const clickY = (e.clientY - containerSize.y - centerY - mapOffset.y) / scale;

				const point: Point = {
					x: (clickX + centerX) / containerSize.width,
					y: (clickY + centerY) / containerSize.height,
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
