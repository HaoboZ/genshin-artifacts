import { type ComponentType, Fragment } from 'react';
import { type Point, type RenderPointProps, type Spot } from './types';

export default function ImageRoutePoints({
	containerSize,
	scale,
	points,
	hidePoints,
	hoverSpot,
	activeSpot,
	extraSpot,
	RenderPoint = ({ point, containerSize, type }) => (
		<circle
			cx={point.x * containerSize.width}
			cy={point.y * containerSize.height}
			r={type ? 2 : 1}
			fill={type === 'active' ? 'blue' : 'lime'}
			fillOpacity={type ? 0.5 : 1}
		/>
	),
}: {
	containerSize: DOMRect;
	scale: number;
	points: Point[];
	hidePoints?: boolean;
	hoverSpot: Spot;
	activeSpot: Spot;
	extraSpot?: Spot;
	RenderPoint?: ComponentType<RenderPointProps>;
}) {
	return (
		<Fragment>
			{!hidePoints &&
				points?.map((point, i) => (
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
			{extraSpot && (
				<RenderPoint
					point={extraSpot.point}
					containerSize={containerSize}
					scale={scale}
					percentage={extraSpot.percentage}
					type='extra'
				/>
			)}
		</Fragment>
	);
}
