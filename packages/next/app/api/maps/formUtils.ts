import { type BackgroundType, type MapType } from '../routes/types';

export const MAP_TYPES: MapType[] = ['none', 'extend', 'scan'];

export const LOCATION_TYPES: BackgroundType[] = [
	'none',
	'mondstadt',
	'liyue',
	'inazuma',
	'sumeru',
	'fontaine',
	'natlan',
	'snezhnaya',
	'nod_krai',
];

export const CALC_EFFICIENCY_SECONDS = 6;

export function calcEfficiency(spots: number, time: number) {
	return spots / (time + CALC_EFFICIENCY_SECONDS);
}
