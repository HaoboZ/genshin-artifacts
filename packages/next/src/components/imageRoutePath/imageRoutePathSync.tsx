import { type BoxProps } from '@mui/material';
import { type Dispatch, useEffect } from 'react';
import useControlledState from '../../hooks/useControlledState';
import ImageRoutePath from './index';
import { type Point, type Spot } from './types';
import { findSpotByTime, findTimeBySpot } from './utils';

export default function ImageRoutePathSync({
	src,
	points,
	time,
	setTime,
	activeSpot: _activeSpot,
	setActiveSpot: _setActiveSpot,
	...props
}: {
	src: string;
	points: Point[];
	time: number;
	setTime: Dispatch<number>;
	activeSpot?: Spot;
	setActiveSpot?: Dispatch<Spot>;
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
		<ImageRoutePath
			src={src}
			points={points}
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
