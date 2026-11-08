import {
	type BackgroundType,
	type MapData,
	type MapType,
	type Point,
	type RouteData,
	type Text,
} from './types';
import { error } from './utils';

type RouteRow = {
	id: string;
	name: string;
	owner: string | null;
	notes: string | null;
	data?: string | null;
};
type RouteMapRow = { route_id: string; map_id: string; sort_order: number };
type MapRow = {
	id: string;
	name: string;
	owner: string | null;
	notes: string | null;
	type: string | null;
	text: string | null;
	background: string | null;
	spots: number | null;
	mora: number | null;
	time: number | null;
	efficiency: number | null;
	x: number | null;
	y: number | null;
	image: string | null;
	video: string | null;
	points: string;
	data?: string | null;
};

export async function getAllRoutesFromDb(env: Env) {
	const routes = await env.DB.prepare(
		'SELECT id, name, owner, notes FROM routes ORDER BY name, id',
	).all<RouteRow>();
	const routeMaps = await env.DB.prepare(
		'SELECT route_id, map_id, sort_order FROM route_maps ORDER BY route_id, sort_order, map_id',
	).all<RouteMapRow>();

	const mapsByRoute = new Map<string, string[]>();
	for (const row of routeMaps.results) {
		const list = mapsByRoute.get(row.route_id) ?? [];
		list.push(row.map_id);
		mapsByRoute.set(row.route_id, list);
	}

	return routes.results.map((route) => ({
		id: route.id,
		name: route.name,
		owner: route.owner ?? undefined,
		notes: route.notes ?? undefined,
		maps: mapsByRoute.get(route.id) ?? [],
	}));
}

export async function getRouteFromDb(env: Env, id: string) {
	const result = await env.DB.prepare(
		`SELECT r.id, r.name, r.owner, r.notes, rm.map_id, m.name AS map_name, m.owner AS map_owner,
			m.notes AS map_notes, m.type AS map_type, m.text AS map_text, m.background AS map_background,
			m.spots AS map_spots, m.mora AS map_mora, m.time AS map_time, m.efficiency AS map_efficiency,
			m.x AS map_x, m.y AS map_y, m.image AS map_image, m.video AS map_video, m.points AS map_points
		 FROM routes r
		 LEFT JOIN route_maps rm ON rm.route_id = r.id
		 LEFT JOIN maps m ON m.id = rm.map_id
		 WHERE r.id = ?
		 ORDER BY rm.sort_order, rm.map_id`,
	)
		.bind(id)
		.all<
			RouteRow & {
				map_id: string | null;
				map_name: string | null;
				map_owner: string | null;
				map_notes: string | null;
				map_type: string | null;
				map_text: string | null;
				map_background: string | null;
				map_spots: number | null;
				map_mora: number | null;
				map_time: number | null;
				map_efficiency: number | null;
				map_x: number | null;
				map_y: number | null;
				map_image: string | null;
				map_video: string | null;
				map_points: string | null;
			}
		>();
	const rows = result.results;
	const route = rows[0];
	if (!route) throw error('Route not found', 404);

	const maps = rows.filter((row) => row.map_id !== null);
	const mapsData = maps.flatMap((row) =>
		row.map_name === null
			? []
			: [
					{
						id: row.map_id!,
						name: row.map_name,
						owner: row.map_owner ?? undefined,
						notes: row.map_notes ?? undefined,
						type: normalizeMapType(row.map_type) ?? undefined,
						text: row.map_text ? parseJson<Text[]>(row.map_text, []) : undefined,
						background: normalizeBackground(row.map_background) ?? undefined,
						spots: row.map_spots ?? 0,
						mora: row.map_mora ?? 0,
						time: row.map_time ?? 0,
						efficiency: row.map_efficiency ?? 0,
						x: row.map_x ?? undefined,
						y: row.map_y ?? undefined,
						image: row.map_image ?? undefined,
						video: row.map_video ?? undefined,
						points: parseJson<Point[]>(row.map_points ?? '[]', []),
					} satisfies MapData,
				],
	);

	return {
		id: route.id,
		name: route.name,
		owner: route.owner ?? undefined,
		notes: route.notes ?? undefined,
		maps: maps.map((row) => row.map_id!),
		mapsData,
	} satisfies RouteData;
}

export async function saveRouteToDb(env: Env, routeData: RouteData) {
	await env.DB.batch([
		env.DB.prepare(
			`INSERT INTO routes (id, name, owner, notes, updated_at)
			 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
			 ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				owner = excluded.owner,
				notes = excluded.notes,
				updated_at = CURRENT_TIMESTAMP`,
		).bind(routeData.id, routeData.name, routeData.owner ?? null, routeData.notes ?? null),
		env.DB.prepare('DELETE FROM route_maps WHERE route_id = ?').bind(routeData.id),
		...routeData.maps.map((mapId, sortOrder) =>
			env.DB.prepare(
				`INSERT INTO route_maps (route_id, map_id, sort_order)
				 VALUES (?, ?, ?)
				 ON CONFLICT(route_id, map_id) DO UPDATE SET sort_order = excluded.sort_order`,
			).bind(routeData.id, mapId, sortOrder),
		),
	]);
}

export async function getRouteIdsByMapId(env: Env, mapId: string) {
	const result = await env.DB.prepare(
		'SELECT route_id FROM route_maps WHERE map_id = ? ORDER BY route_id',
	)
		.bind(mapId)
		.all<{ route_id: string }>();
	return result.results.map((row) => row.route_id);
}

export async function deleteRouteFromDb(env: Env, id: string) {
	const result = await env.DB.prepare('DELETE FROM routes WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Route not found', 404);
}

export async function getAllMapsFromDb(env: Env) {
	const result = await env.DB.prepare(
		`SELECT id, name, owner, notes, type, text, background, spots, mora, time, efficiency, x, y, image, video, points
		 FROM maps
		 ORDER BY name, id`,
	).all<MapRow>();
	return result.results.map((row) => mapRowToMapData(row));
}

export async function getMapFromDb(env: Env, id: string) {
	const row = await env.DB.prepare(
		`SELECT id, name, owner, notes, type, text, background, spots, mora, time, efficiency, x, y, image, video, points
		 FROM maps WHERE id = ?`,
	)
		.bind(id)
		.first<MapRow>();
	if (!row) throw error('Map not found', 404);
	return mapRowToMapData(row);
}

export async function saveMapToDb(env: Env, mapData: MapData) {
	await env.DB.prepare(
		`INSERT INTO maps (
			id, name, owner, notes, type, text, background, spots, mora, time, efficiency, x, y, image, video, points, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			owner = excluded.owner,
			notes = excluded.notes,
			type = excluded.type,
			text = excluded.text,
			background = excluded.background,
			spots = excluded.spots,
			mora = excluded.mora,
			time = excluded.time,
			efficiency = excluded.efficiency,
			x = excluded.x,
			y = excluded.y,
			image = excluded.image,
			video = excluded.video,
			points = excluded.points,
			updated_at = CURRENT_TIMESTAMP`,
	)
		.bind(
			mapData.id,
			mapData.name,
			mapData.owner ?? null,
			mapData.notes ?? null,
			normalizeMapType(mapData.type) ?? null,
			mapData.text ? JSON.stringify(mapData.text) : null,
			normalizeBackground(mapData.background) ?? null,
			mapData.spots ?? null,
			mapData.mora ?? null,
			mapData.time ?? null,
			mapData.efficiency ?? null,
			mapData.x ?? null,
			mapData.y ?? null,
			mapData.image ?? null,
			mapData.video ?? null,
			JSON.stringify(mapData.points ?? []),
		)
		.run();
}

export async function deleteMapFromDb(env: Env, id: string) {
	const result = await env.DB.prepare('DELETE FROM maps WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Map not found', 404);
}

function mapRowToMapData(row: MapRow): MapData {
	return {
		id: row.id,
		name: row.name,
		owner: row.owner ?? undefined,
		notes: row.notes ?? undefined,
		type: normalizeMapType(row.type) ?? undefined,
		text: row.text ? parseJson<Text[]>(row.text, []) : undefined,
		background: normalizeBackground(row.background) ?? undefined,
		spots: row.spots ?? 0,
		mora: row.mora ?? 0,
		time: row.time ?? 0,
		efficiency: row.efficiency ?? 0,
		x: row.x ?? undefined,
		y: row.y ?? undefined,
		image: row.image ?? undefined,
		video: row.video ?? undefined,
		points: parseJson<Point[]>(row.points, []),
	};
}

function normalizeMapType(value: unknown): MapType | undefined {
	if (typeof value !== 'string') return undefined;
	const type = value.toLowerCase();
	if (['extend', 'extra'].includes(type)) return type as MapType;
	return undefined;
}

function normalizeBackground(value: unknown): BackgroundType | undefined {
	if (typeof value !== 'string') return undefined;
	const background = value.replace(/\.png$/i, '').toLowerCase();
	if (
		[
			'mondstadt',
			'liyue',
			'inazuma',
			'sumeru',
			'fontaine',
			'natlan',
			'nod_krai',
			'snezhnaya',
		].includes(background)
	) {
		return background as BackgroundType;
	}
	return undefined;
}

function parseJson<T>(value: string, fallback: T) {
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}
