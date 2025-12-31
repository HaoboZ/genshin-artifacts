import { type ComponentType, Fragment } from 'react';
import { type Point, type RenderPathProps } from './types';

export default function ImageRoutePaths({
	containerSize,
	scale,
	points,
	RenderPath = ({ point1, point2, containerSize }) => {
		const x1 = point1.x * containerSize.width;
		const y1 = point1.y * containerSize.height;
		const x2 = point2.x * containerSize.width;
		const y2 = point2.y * containerSize.height;

		return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke='white' />;
	},
}: {
	containerSize: DOMRect;
	scale: number;
	points: Point[];
	RenderPath?: ComponentType<RenderPathProps>;
}) {
	return (
		<Fragment>
			{points?.map?.((point, i) => {
				if (i === 0) return null;
				const prevPoint = points[i - 1];

				return (
					<RenderPath
						key={`path-${i}`}
						point1={prevPoint}
						point2={point}
						containerSize={containerSize}
						scale={scale}
					/>
				);
			})}
		</Fragment>
	);
}
