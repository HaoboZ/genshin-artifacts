import { type BoxProps } from '@mui/material';
import { type ComponentType, type Dispatch, useEffect } from 'react';
import useControlledState from '../../hooks/useControlledState';
import ImageRoute from './index';
import { type Point, type RenderPathProps, type RenderPointProps, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function ImageRouteSync({
	src,
	points,
	hidePoints,
	time,
	setTime,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	...props
}: {
	src: string;
	points: Point[];
	hidePoints?: boolean;
	time: number;
	setTime: Dispatch<number>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
	RenderPoint?: ComponentType<RenderPointProps>;
	RenderPath?: ComponentType<RenderPathProps>;
} & BoxProps) {
	const [activeSpot, setActiveSpot] = useControlledState(_activeSpot, _setActiveSpot);

	// sync activeSpot with time
	useEffect(() => {
		const spot = findSpotByTime(points, time);
		if (!spot) return;
		setActiveSpot(spot);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, time]);

	return (
		<ImageRoute
			src={src}
			points={points}
			hidePoints={hidePoints}
			activeSpot={activeSpot}
			setActiveSpot={(spot) => {
				setActiveSpot(spot);

				const calculatedTime = findTimeBySpot(points, spot);
				if (calculatedTime !== null) {
					setTime(calculatedTime);
				}
			}}
			{...props}
		/>
	);
}
