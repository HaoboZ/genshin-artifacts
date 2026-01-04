import { type ComponentType, Fragment } from 'react';
import { type Point, type RenderPointProps, type Spot } from './types';

function DefaultRenderPoint({ point, containerSize, type }: RenderPointProps) {
	return (
		<circle
			cx={point.x * containerSize.width}
			cy={point.y * containerSize.height}
			r={type ? 2 : 1}
			fill={type === 'active' ? 'blue' : 'lime'}
			fillOpacity={type ? 0.5 : 1}
		/>
	);
}

export default function ImageRoutePoints({
	containerSize,
	scale,
	points,
	hoverSpot,
	activeSpot,
	RenderPoint = DefaultRenderPoint,
}: {
	containerSize: DOMRect;
	scale: number;
	points: Point[];
	hoverSpot: Spot;
	activeSpot: Spot;
	RenderPoint?: ComponentType<RenderPointProps>;
}) {
	return (
		<Fragment>
			{points?.map((point, i) => (
				<RenderPoint
					key={`point-${i}`}
					point={point}
					containerSize={containerSize}
					scale={scale}
				/>
			))}
			{hoverSpot && (
				<RenderPoint
					point={hoverSpot.point}
					containerSize={containerSize}
					scale={scale}
					percentage={hoverSpot.percentage}
					type='hover'
				/>
			)}
			{activeSpot && (
				<RenderPoint
					point={activeSpot.point}
					containerSize={containerSize}
					scale={scale}
					percentage={activeSpot.percentage}
					type='active'
				/>
			)}
		</Fragment>
	);
}
