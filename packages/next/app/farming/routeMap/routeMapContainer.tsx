import useEventListener from '@/src/hooks/useEventListener';
import { Box, BoxProps } from '@mui/material';
import { Dispatch, RefObject, SetStateAction, useState } from 'react';
import { clamp } from 'remeda';

import { clampPosition, getClosestPointOnPath, Point, Spot } from './utils';

export default function RouteMapContainer({
	containerRef,
	containerSize,
	setContainerSize,
	scale,
	setScale,
	mapOffset,
	setMapOffset,
	points,
	setPoints,
	hoverSpot,
	setHoverSpot,
	setActiveSpot,
	sx,
	...props
}: {
	containerRef: RefObject<HTMLDivElement>;
	containerSize: DOMRect;
	setContainerSize: Dispatch<SetStateAction<DOMRect>>;
	scale: number;
	setScale: Dispatch<SetStateAction<number>>;
	mapOffset: Point;
	setMapOffset: Dispatch<SetStateAction<Point>>;
	points: Point[];
	setPoints?: Dispatch<SetStateAction<Point[]>>;
	hoverSpot: Spot;
	setHoverSpot: Dispatch<SetStateAction<Spot>>;
	setActiveSpot: Dispatch<Spot>;
} & Omit<BoxProps, 'ref'>) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'resize',
		() => setContainerSize(containerRef.current.getBoundingClientRect()),
		true,
	);

	// eslint-disable-next-line react-hooks/refs
	useEventListener(containerRef.current, 'wheel', (e) => {
		e.preventDefault();

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
				width: '100%',
				position: 'relative',
				aspectRatio: 1,
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

				// show hover preview when setPoints is null
				if (setPoints || !containerSize) return;

				const mouseX = (e.clientX - containerSize.x - mapOffset.x) / scale;
				const mouseY = (e.clientY - containerSize.y - mapOffset.y) / scale;
				setHoverSpot(getClosestPointOnPath(containerSize, points, scale, mouseX, mouseY));
			}}
			onMouseUp={() => setIsDragging(false)}
			onClick={(e) => {
				if (setPoints) {
					if (isDragging) return;

					const clickX = e.clientX - containerSize.x;
					const clickY = e.clientY - containerSize.y;

					const newPoint: Point = {
						x: (clickX - mapOffset.x) / (containerSize.width * scale),
						y: (clickY - mapOffset.y) / (containerSize.height * scale),
						artifact: 1,
					};

					// hold ctrl for non artifact point
					if (e.ctrlKey) delete newPoint.artifact;

					setPoints((prev) => [...prev, newPoint]);
				} else if (hoverSpot) {
					setActiveSpot(hoverSpot);
				}
			}}
			onContextMenu={(e) => e.preventDefault()}
			{...props}
		/>
	);
}
