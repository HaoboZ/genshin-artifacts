import type { RenderPointProps } from '@/components/imageRoute/types';

export function EditRouteRenderPoint({ point, containerSize, scale, type }: RenderPointProps) {
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
