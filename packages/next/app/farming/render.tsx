import { type RenderPathProps, type RenderPointProps } from '@/components/imageRoute/types';

export function MapRenderPoint({ point, containerSize, type, percentage }: RenderPointProps) {
	if (type && percentage) return null;

	return (
		<circle
			cx={point.x * containerSize.width}
			cy={point.y * containerSize.height}
			r={containerSize.width / 200}
			fill={{ hover: 'white', active: 'black' }[type] ?? point.data ?? 'lime'}
			fillOpacity={type === 'hover' ? 1 : 0}
			stroke={{ hover: 'white', active: 'black' }[type] ?? point.data ?? 'lime'}
			strokeWidth={containerSize.width / 1000}
			style={{
				transformOrigin: `${point.x * containerSize.width}px ${point.y * containerSize.height}px`,
				animation: type === 'active' ? 'pulse 2s ease-in-out infinite' : undefined,
			}}
		/>
	);
}

export function MapRenderPath({ point1, point2, containerSize }: RenderPathProps) {
	const x1 = point1.x * containerSize.width;
	const y1 = point1.y * containerSize.height;
	const x2 = point2.x * containerSize.width;
	const y2 = point2.y * containerSize.height;

	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.sqrt(dx * dx + dy * dy);

	const radius = containerSize.width / 200;
	if (!length || length < radius * 2) return null;

	const ux = dx / length;
	const uy = dy / length;

	return (
		<line
			x1={x1 + ux * radius}
			y1={y1 + uy * radius}
			x2={x2 - ux * radius}
			y2={y2 - uy * radius}
			stroke={point2.data ?? 'lime'}
			strokeWidth={containerSize.width / 1000}
		/>
	);
}

export function MapRenderExtra() {
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
		</defs>
	);
}
