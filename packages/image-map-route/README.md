# image-map-route

React utilities for rendering and syncing image map routes.

## Install

```bash
npm i image-map-route
```

## Example

- Example site: Coming soon.

## Usage

### Basic route rendering

```tsx
import { ImageRoute, type Point } from 'image-map-route';

const points: Point[] = [
	{ x: 0.12, y: 0.3, marked: 1, start: 0, end: 1.2 },
	{ x: 0.2, y: 0.35, marked: 0 },
	{ x: 0.45, y: 0.5, marked: 2 },
];

export function RoutePreview() {
	return <ImageRoute points={points} />;
}
```

### Sync with video playback

```tsx
import { ImageRoute, type Point, type Spot, useRouteVideoSync } from 'image-map-route';

const points: Point[] = [
	{ x: 0.12, y: 0.3, start: 0, end: 1.2 },
	{ x: 0.2, y: 0.35 },
	{ x: 0.45, y: 0.5 },
];

export function RouteWithVideo() {
	const { routeRef, videoRef, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	return (
		<div>
			<video ref={videoRef} src='/route.mp4' controls />
			<ImageRoute
				ref={routeRef}
				points={points}
				activeSpot={activeSpot}
				setActiveSpot={setActiveSpot}
				followActiveSpot
			/>
		</div>
	);
}
```

## API

### Components

#### `ImageRoute`

```ts
function ImageRoute(props: MapImageRouteProps): JSX.Element;
```

Main component that renders a scalable route on an image map.

**Props (MapImageRouteProps)**

- `points: Point[]`  
  Route points in normalized coordinates (0..1).
- `addPoint?: Dispatch<Point>`  
  If provided, clicking the route adds a point. Otherwise clicks select a spot.
- `activeSpot?: Spot` / `setActiveSpot?: Dispatch<Spot>`  
  Controlled active spot selection.
- `followActiveSpot?: boolean`  
  Auto-center the view on the active spot.
- `RenderPoint?: ComponentType<RenderPointProps>`  
  Custom point renderer.
- `RenderPath?: ComponentType<RenderPathProps>`  
  Custom path renderer.
- `RenderExtra?: ComponentType<RenderExtraProps>`  
  Custom extra overlay renderer.
- `deps?: string`  
  Trigger recalculation of initial/animated position when changed.
-

`getInitialPosition?: (containerSize: DOMRect) => { scale?: number; offset?: { x: number; y: number } }`  
Initial zoom/offset when the container is ready.

-

`getAnimatedPosition?: (containerSize: DOMRect) => { scale?: number; offset?: { x: number; y: number } }`  
Optional animated zoom/offset after initial render.

- `innerChildren?: ReactNode`  
  Children rendered inside the container.
- `sx?: CSSProperties`  
  Inline styles for the container.

### Hooks

#### `useRouteVideoSync`

```ts
function useRouteVideoSync(points: Point[]): {
	routeRef: React.RefObject<HTMLDivElement>;
	videoRef: React.RefObject<HTMLVideoElement>;
	time: number;
	setTime: (time: number) => void;
	activeSpot: Spot | null;
	setActiveSpot: (spot: Spot) => void;
};
```

Syncs the map route with an HTML video element. Call `setActiveSpot` to seek the
video to the corresponding time, or scrub the video to update the active spot.

### Types

```ts
type Point = {
	x: number;
	y: number;
	marked?: number;
	start?: number;
	end?: number;
	type?: string;
	extra?: string;
};

type Spot = {
	point: { x: number; y: number };
	pointIndex?: number;
	percentage?: number;
};
```

### Utilities

```ts
import {
	calculateCenterZoom,
	calculateOptimalZoom,
	findSpotByTime,
	findTimeBySpot,
} from 'image-map-route';
```

- `calculateCenterZoom(point, containerSize, scale)`
- `calculateOptimalZoom(points, containerSize, paddingPercent)`
- `findSpotByTime(points, time)`
- `findTimeBySpot(points, spot)`
