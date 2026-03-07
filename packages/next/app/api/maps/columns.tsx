import type { GridColDef } from '@mui/x-data-grid';
import { toTitleCase } from 'remeda';
import type { MapData } from '../routes/types';

export type SortKey =
	| 'name'
	| 'owner'
	| 'notes'
	| 'type'
	| 'background'
	| 'spots'
	| 'mora'
	| 'time'
	| 'efficiency';
export type RouteMapRow = MapData & { order?: number; actions?: never };

export const mapColumns: GridColDef<RouteMapRow>[] = [
	{
		field: 'name',
		headerName: 'Name',
		flex: 2,
		minWidth: 150,
		sortable: true,
		cellClassName: ({ row }) => (!row.video ? 'no-video' : ''),
	},
	{
		field: 'background',
		headerName: 'Location',
		flex: 1,
		minWidth: 100,
		sortable: true,
		valueGetter: (value) => toTitleCase(value || 'None'),
	},
	{ field: 'owner', headerName: 'Owner', flex: 1, minWidth: 100, sortable: true },
	{ field: 'notes', headerName: 'Notes', flex: 2, minWidth: 100, sortable: true },
	{
		field: 'type',
		headerName: 'Type',
		flex: 1,
		minWidth: 100,
		sortable: true,
		valueGetter: (value) => toTitleCase(value || ''),
	},
	{ field: 'spots', headerName: 'Spots', width: 75, type: 'number', sortable: true },
	{
		field: 'mora',
		headerName: 'Mora',
		width: 75,
		type: 'number',
		sortable: true,
		cellClassName: ({ value, row }) => (value === row.spots ? 'mora-match' : ''),
	},
	{ field: 'time', headerName: 'Time', width: 75, type: 'number', sortable: true },
	{
		field: 'efficiency',
		headerName: 'Efficiency',
		description: 'Artifacts / Minute',
		width: 100,
		type: 'number',
		sortable: true,
		valueGetter: (value) => value * 60,
		renderCell: ({ value }) => {
			const ratio = Math.min(Math.max(value / 15, 0), 1);
			const red = Math.round(255 * (1 - ratio));
			const green = Math.round(255 * ratio);
			return <span style={{ color: `rgb(${red}, ${green}, 0)` }}>{value.toFixed(2)}</span>;
		},
	},
];
