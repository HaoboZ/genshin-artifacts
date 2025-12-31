import { type RenderPathProps, type RenderPointProps } from '@/components/imageRoute/types';

export function RouteRenderPoint({ point, containerSize, scale, type }: RenderPointProps) {
	return (
		<circle
			cx={point.x * containerSize.width}
			cy={point.y * containerSize.height}
			r={containerSize.width / (type ? 75 : 500 * scale)}
			fill={{ active: 'blue', hover: 'lime', extra: 'yellow' }[type] ?? 'black'}
			fillOpacity={type ? 0.5 : 1}
			stroke={{ active: 'blue', hover: 'lime', extra: 'yellow' }[type] ?? 'black'}
			strokeWidth={containerSize.width / 500}
			style={{
				transformOrigin: `${point.x * containerSize.width}px ${point.y * containerSize.height}px`,
				animation: type === 'active' ? 'pulse 2s ease-in-out infinite' : undefined,
			}}
		/>
	);
}

export function RouteRenderPath({ point1, point2, containerSize }: RenderPathProps) {
	if (point2.data === 'hidden') return null;
	const x1 = point1.x * containerSize.width;
	const y1 = point1.y * containerSize.height;
	let x2 = point2.x * containerSize.width;
	let y2 = point2.y * containerSize.height;

	// scale arrow offset based on container size
	const arrowOffset = 3;

	// shorten line for arrows to stop inside arrowhead
	if (point2.marked) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const length = Math.sqrt(dx * dx + dy * dy);

		if (!length) return null;

		// only shorten if the line is long enough
		if (length > arrowOffset) {
			x2 = x2 - (dx / length) * arrowOffset;
			y2 = y2 - (dy / length) * arrowOffset;
		}
	}

	return (
		<line
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke='red'
			strokeWidth={containerSize.width / 300}
			markerEnd={point2.marked && 'url(#arrowhead)'}
		/>
	);
}

export function RouteMarker() {
	return (
		<defs>
			<style jsx>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
						transform: scale(1);
					}
					50% {
						opacity: 0.75;
						transform: scale(1.5);
					}
				}
			`}</style>
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
	);
}
