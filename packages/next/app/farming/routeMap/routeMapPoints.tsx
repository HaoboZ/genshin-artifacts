import { Fragment, useMemo, useRef } from 'react';
import { type Point, type Spot } from './utils';

export default function RouteMapPoints({
	containerSize,
	scale,
	points,
	showPoints,
	hoverSpot,
	activeSpot,
}: {
	containerSize: DOMRect;
	scale: number;
	points: Point[];
	showPoints?: boolean;
	hoverSpot: Spot;
	activeSpot: Spot;
}) {
	const prevSpotRef = useRef<Spot>(null);

	/* eslint-disable react-hooks/refs */
	const shouldTransition = useMemo(() => {
		if (!activeSpot || !prevSpotRef.current) {
			prevSpotRef.current = activeSpot;
			return true;
		}

		const dx = activeSpot.point.x - prevSpotRef.current.point.x;
		const dy = activeSpot.point.y - prevSpotRef.current.point.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const threshold = containerSize.width * 0.05;

		const shouldAnimate = distance <= threshold;
		prevSpotRef.current = activeSpot;

		return shouldAnimate;
	}, [activeSpot, containerSize]);

	return (
		<Fragment>
			<style jsx>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
						transform: scale(1);
					}
					50% {
						opacity: 0.7;
						transform: scale(1.2);
					}
				}
			`}</style>
			{showPoints &&
				points.map((point, i) => {
					const x = point.x * containerSize.width;
					const y = point.y * containerSize.height;

					return (
						<circle
							key={`dot-${i}`}
							cx={x}
							cy={y}
							r={3 / scale}
							fill='#0000ff'
							stroke='white'
							strokeWidth={0.5 / scale}
						/>
					);
				})}
			{hoverSpot && (
				<circle
					cx={hoverSpot.point.x}
					cy={hoverSpot.point.y}
					r={3}
					fill='#ffff00'
					fillOpacity={0.6}
					stroke='#ff8800'
					strokeWidth={1}
				/>
			)}
			{activeSpot && (
				<g>
					<circle
						cx={activeSpot.point.x}
						cy={activeSpot.point.y}
						r={4}
						fill='#00ff00'
						stroke='#008800'
						strokeWidth={1}
						style={{
							animation: 'pulse 2s ease-in-out infinite',
							transformOrigin: `${activeSpot.point.x}px ${activeSpot.point.y}px`,
							transition: shouldTransition ? 'cx 0.25s linear, cy 0.25s linear' : 'none',
						}}
					/>
				</g>
			)}
		</Fragment>
	);
}
