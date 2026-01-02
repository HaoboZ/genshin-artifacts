import { Box, type BoxProps } from '@mui/material';
import { type Dispatch, type RefObject, useState } from 'react';
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
	setIsAnimating,
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
	setIsAnimating: Dispatch<boolean>;
	onHoverRoute?: (point: { x: number; y: number }) => void;
	onClickRoute?: (point: { x: number; y: number }) => void;
} & Omit<BoxProps, 'ref'>) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	// eslint-disable-next-line react-hooks/refs
	useEventListener(containerRef.current, 'wheel', (e) => {
		e.preventDefault();

		// Disable animation on wheel event
		setIsAnimating?.(false);

		// calculate mouse position relative to image center before zoom
		const centerX = containerSize.width / 2;
		const centerY = containerSize.height / 2;
		const mouseX = (e.clientX - containerSize.x - centerX - mapOffset.x) / scale;
		const mouseY = (e.clientY - containerSize.y - centerY - mapOffset.y) / scale;
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

				if (!containerSize) return;
				onHoverRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
			}}
			onMouseUp={() => setIsDragging(false)}
			onClick={(e) => {
				if (isDragging || !containerSize) return;
				onClickRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
			}}
			onContextMenu={(e) => e.preventDefault()}
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
