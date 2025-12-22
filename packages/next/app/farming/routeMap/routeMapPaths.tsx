import { Fragment } from 'react';

import { Point } from './utils';

export default function RouteMapPaths({
	containerSize,
	points,
}: {
	containerSize: DOMRect;
	points: Point[];
}) {
	return (
		<Fragment>
			<defs>
				<marker
					id='arrowhead'
					markerWidth={8}
					markerHeight={8}
					refX={3.3}
					refY={2.5}
					orient='auto'>
					<polygon points='0 0, 5 2.5, 0 5' fill='#ff0000' />
				</marker>
			</defs>
			{points.map((point, i) => {
				if (i === 0) return null;
				const prevPoint = points[i - 1];

				const x1 = prevPoint.x * containerSize.width;
				const y1 = prevPoint.y * containerSize.height;
				let x2 = point.x * containerSize.width;
				let y2 = point.y * containerSize.height;

				// scale arrow offset based on container size
				const arrowOffset = containerSize.width * 0.005;

				// shorten line for arrows to stop inside arrowhead
				if (!point.temp) {
					const dx = x2 - x1;
					const dy = y2 - y1;
					const length = Math.sqrt(dx * dx + dy * dy);

					// only shorten if the line is long enough
					if (length > arrowOffset) {
						x2 = x2 - (dx / length) * arrowOffset;
						y2 = y2 - (dy / length) * arrowOffset;
					}
				}

				// line width as 0.3% of container width
				const lineWidth = containerSize.width * 0.003;

				return (
					<line
						key={`line-${i}`}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke='#ff0000'
						strokeWidth={lineWidth}
						markerEnd={point.temp ? undefined : 'url(#arrowhead)'}
					/>
				);
			})}
		</Fragment>
	);
}
