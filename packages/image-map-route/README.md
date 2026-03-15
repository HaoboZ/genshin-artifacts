# image-map-route

React utilities for rendering and syncing image map routes.

## Install

```bash
npm i image-map-route
```

## Website

https://genshin-artifacts.vercel.app/imageMapRoute

## Usage

### ImageMapRoute

Main component that renders the map image, route paths, and interactive points.

### useRouteVideoSync

Hook that syncs route playback with a video element and exposes time/spot helpers.

### calculateCenterZoom

Utility that centers the view on a normalized point at a given scale.

### calculateOptimalZoom

Utility that fits a set of points in the container and returns a scale/offset.

### findSpotByTime

Utility that interpolates the active spot for a given playback time.

### findTimeBySpot

Utility that maps a spot back to the corresponding playback time.
