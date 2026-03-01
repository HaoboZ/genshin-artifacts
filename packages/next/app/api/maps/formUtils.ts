import { type BackgroundType, type MapType } from '../routes/types';

export const MAP_TYPES: MapType[] = ['normal', 'extend', 'scan'];

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

export function formatLabel(value: string) {
	return value
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function calcEfficiency(spots: number, time: number) {
	return spots / (time + 6);
}
