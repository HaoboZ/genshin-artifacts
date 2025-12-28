import { type RenderPathProps, type RenderPointProps } from '@/components/imageRoute/types';

const radius = 6;

export function MapRenderPoint({ point, containerSize, type, percentage }: RenderPointProps) {
	if (type && percentage) return null;

	return (
		<circle
			cx={point.x * containerSize.width}
			cy={point.y * containerSize.height}
			r={radius}
			fillOpacity={0}
			stroke={type === 'hover' ? 'white' : (point.data ?? 'lime')}
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

	if (length < radius * 2) return null;

	const ux = dx / length;
	const uy = dy / length;

	return (
		<line
			x1={x1 + ux * radius}
			y1={y1 + uy * radius}
			x2={x2 - ux * radius}
			y2={y2 - uy * radius}
			stroke={point2.data ?? 'lime'}
		/>
	);
}
