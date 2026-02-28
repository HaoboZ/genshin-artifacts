import { type MapData, type RouteData } from './types';
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
	time: number | null;
	count: number | null;
	mora: number | null;
	efficiency: number | null;
	x: number | null;
	y: number | null;
	image: string | null;
	video: string | null;
	points: string;
	data?: string | null;
};

let schemaPromise: Promise<void> | null = null;

export function ensureSchema(env: Env) {
	if (!schemaPromise) {
		schemaPromise = createOrMigrateSchema(env).catch((cause) => {
			schemaPromise = null;
			throw cause;
		});
	}

	return schemaPromise;
}

export async function getAllRoutesFromDb(env: Env) {
	await ensureSchema(env);

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
	await ensureSchema(env);

	const route = await env.DB.prepare('SELECT id, name, owner, notes FROM routes WHERE id = ?')
		.bind(id)
		.first<RouteRow>();
	if (!route) throw error('Route not found', 404);

	const maps = await env.DB.prepare(
		'SELECT map_id, sort_order FROM route_maps WHERE route_id = ? ORDER BY sort_order, map_id',
	)
		.bind(id)
		.all<{ map_id: string; sort_order: number }>();

	const mapIds = maps.results.map((row) => row.map_id);
	const mapsData: MapData[] = [];
	for (const mapId of mapIds) {
		try {
			mapsData.push(await getMapFromDb(env, mapId));
		} catch {
			// Keep route readable even if related map was removed externally.
		}
	}

	return {
		id: route.id,
		name: route.name,
		owner: route.owner ?? undefined,
		notes: route.notes ?? undefined,
		maps: mapIds,
		mapsData,
	} satisfies RouteData;
}

export async function saveRouteToDb(env: Env, routeData: RouteData) {
	await ensureSchema(env);

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
	]);

	if (!routeData.maps.length) return;

	await env.DB.batch(
		routeData.maps.map((mapId, sortOrder) =>
			env.DB.prepare(
				`INSERT INTO route_maps (route_id, map_id, sort_order)
				 VALUES (?, ?, ?)
				 ON CONFLICT(route_id, map_id) DO UPDATE SET sort_order = excluded.sort_order`,
			).bind(routeData.id, mapId, sortOrder),
		),
	);
}

export async function getRouteIdsByMapId(env: Env, mapId: string) {
	await ensureSchema(env);
	const result = await env.DB.prepare(
		'SELECT route_id FROM route_maps WHERE map_id = ? ORDER BY route_id',
	)
		.bind(mapId)
		.all<{ route_id: string }>();
	return result.results.map((row) => row.route_id);
}

export async function deleteRouteFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const result = await env.DB.prepare('DELETE FROM routes WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Route not found', 404);
}

export async function getAllMapsFromDb(env: Env) {
	await ensureSchema(env);
	const result = await env.DB.prepare(
		`SELECT id, name, owner, notes, type, text, background, spots, time, count, mora, efficiency, x, y, image, video, points
		 FROM maps
		 ORDER BY name, id`,
	).all<MapRow>();
	return result.results.map((row) => mapRowToMapData(row));
}

export async function getMapFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const row = await env.DB.prepare(
		`SELECT id, name, owner, notes, type, text, background, spots, time, count, mora, efficiency, x, y, image, video, points
		 FROM maps WHERE id = ?`,
	)
		.bind(id)
		.first<MapRow>();
	if (!row) throw error('Map not found', 404);
	return mapRowToMapData(row);
}

export async function saveMapToDb(env: Env, mapData: MapData) {
	await ensureSchema(env);

	await env.DB.prepare(
		`INSERT INTO maps (
			id, name, owner, notes, type, text, background, spots, time, count, mora, efficiency, x, y, image, video, points, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			owner = excluded.owner,
			notes = excluded.notes,
			type = excluded.type,
			text = excluded.text,
			background = excluded.background,
			spots = excluded.spots,
			time = excluded.time,
			count = excluded.count,
			mora = excluded.mora,
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
			mapData.time ?? null,
			mapData.count ?? null,
			mapData.mora ?? null,
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
	await ensureSchema(env);
	const result = await env.DB.prepare('DELETE FROM maps WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Map not found', 404);
}

async function createOrMigrateSchema(env: Env) {
	await env.DB.exec(`
		PRAGMA foreign_keys = ON;
		CREATE TABLE IF NOT EXISTS routes (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			owner TEXT,
			notes TEXT,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS maps (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			owner TEXT,
			notes TEXT,
			type TEXT CHECK (type IN ('normal','extend','scan') OR type IS NULL),
			text TEXT,
			background TEXT CHECK (background IN ('mondstadt','liyue','inazuma','sumeru','fontaine','natlan','snezhnaya') OR background IS NULL),
			spots INTEGER,
			time REAL,
			count INTEGER,
			mora INTEGER,
			efficiency REAL,
			x REAL,
			y REAL,
			image TEXT,
			video TEXT,
			points TEXT NOT NULL DEFAULT '[]',
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS route_maps (
			route_id TEXT NOT NULL,
			map_id TEXT NOT NULL,
			sort_order INTEGER NOT NULL,
			PRIMARY KEY (route_id, map_id),
			FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
			FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
		);
		CREATE INDEX IF NOT EXISTS idx_route_maps_route_order ON route_maps(route_id, sort_order);
		CREATE INDEX IF NOT EXISTS idx_route_maps_map ON route_maps(map_id);
	`);

	if (!(await hasColumn(env, 'routes', 'notes'))) {
		await env.DB.exec('ALTER TABLE routes ADD COLUMN notes TEXT');
	}
	if (!(await hasColumn(env, 'maps', 'notes'))) {
		await env.DB.exec('ALTER TABLE maps ADD COLUMN notes TEXT');
	}

	await migrateLegacyRouteRows(env);
	await migrateLegacyMapRows(env);
}

async function migrateLegacyRouteRows(env: Env) {
	if (!(await hasColumn(env, 'routes', 'data'))) return;

	if (!(await hasColumn(env, 'routes', 'name'))) {
		await env.DB.exec('ALTER TABLE routes ADD COLUMN name TEXT');
	}
	if (!(await hasColumn(env, 'routes', 'owner'))) {
		await env.DB.exec('ALTER TABLE routes ADD COLUMN owner TEXT');
	}
	if (!(await hasColumn(env, 'routes', 'notes'))) {
		await env.DB.exec('ALTER TABLE routes ADD COLUMN notes TEXT');
	}

	const routes = await env.DB.prepare('SELECT id, data FROM routes').all<{
		id: string;
		data: string | null;
	}>();
	for (const row of routes.results) {
		if (!row.data) continue;
		const legacy = parseJson<Record<string, unknown>>(row.data, {});
		const name = String(legacy.name ?? '').trim();
		const owner = legacy.owner ? String(legacy.owner) : null;
		const notes = legacy.notes ? String(legacy.notes) : null;
		const maps = Array.isArray(legacy.maps) ? legacy.maps.map(String) : [];

		await env.DB.prepare(
			'UPDATE routes SET name = ?, owner = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
		)
			.bind(name || row.id, owner, notes, row.id)
			.run();

		await env.DB.prepare('DELETE FROM route_maps WHERE route_id = ?').bind(row.id).run();
		if (maps.length) {
			await env.DB.batch(
				maps.map((mapId, sortOrder) =>
					env.DB.prepare(
						`INSERT OR REPLACE INTO route_maps (route_id, map_id, sort_order)
						 VALUES (?, ?, ?)`,
					).bind(row.id, mapId, sortOrder),
				),
			);
		}
	}
}

async function migrateLegacyMapRows(env: Env) {
	if (!(await hasColumn(env, 'maps', 'data'))) return;

	for (const [column, type] of [
		['name', 'TEXT'],
		['owner', 'TEXT'],
		['notes', 'TEXT'],
		['type', 'TEXT'],
		['text', 'TEXT'],
		['background', 'TEXT'],
		['spots', 'INTEGER'],
		['time', 'REAL'],
		['count', 'INTEGER'],
		['mora', 'INTEGER'],
		['efficiency', 'REAL'],
		['x', 'REAL'],
		['y', 'REAL'],
		['image', 'TEXT'],
		['video', 'TEXT'],
		['points', "TEXT NOT NULL DEFAULT '[]'"],
	] as const) {
		if (!(await hasColumn(env, 'maps', column))) {
			await env.DB.exec(`ALTER TABLE maps ADD COLUMN ${column} ${type}`);
		}
	}

	const maps = await env.DB.prepare('SELECT id, data FROM maps').all<{
		id: string;
		data: string | null;
	}>();
	for (const row of maps.results) {
		if (!row.data) continue;
		const legacy = parseJson<Record<string, unknown>>(row.data, {});

		await env.DB.prepare(
			`UPDATE maps SET
				name = ?, owner = ?, notes = ?, type = ?, text = ?, background = ?, spots = ?, time = ?, count = ?, mora = ?, efficiency = ?, x = ?, y = ?, image = ?, video = ?, points = ?, updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
		)
			.bind(
				String(legacy.name ?? row.id),
				legacy.owner ? String(legacy.owner) : null,
				legacy.notes ? String(legacy.notes) : null,
				normalizeMapType(legacy.type) ?? null,
				legacy.text ? JSON.stringify(legacy.text) : null,
				normalizeBackground(legacy.background) ?? null,
				typeof legacy.spots === 'number' ? legacy.spots : null,
				typeof legacy.time === 'number' ? legacy.time : null,
				typeof legacy.count === 'number' ? legacy.count : null,
				typeof legacy.mora === 'number' ? legacy.mora : null,
				typeof legacy.efficiency === 'number' ? legacy.efficiency : null,
				typeof legacy.x === 'number' ? legacy.x : null,
				typeof legacy.y === 'number' ? legacy.y : null,
				legacy.image ? String(legacy.image) : null,
				legacy.video ? String(legacy.video) : null,
				JSON.stringify(Array.isArray(legacy.points) ? legacy.points : []),
				row.id,
			)
			.run();
	}
}

async function hasColumn(env: Env, table: 'routes' | 'maps' | 'route_maps', column: string) {
	const result = await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
	return result.results.some((item) => item.name === column);
}

function mapRowToMapData(row: MapRow): MapData {
	return {
		id: row.id,
		name: row.name,
		owner: row.owner ?? undefined,
		notes: row.notes ?? undefined,
		type: normalizeMapType(row.type) ?? undefined,
		text: row.text ? parseJson<MapData['text']>(row.text, []) : undefined,
		background: normalizeBackground(row.background) ?? undefined,
		spots: row.spots ?? undefined,
		time: row.time ?? undefined,
		count: row.count ?? undefined,
		mora: row.mora ?? undefined,
		efficiency: row.efficiency ?? undefined,
		x: row.x ?? undefined,
		y: row.y ?? undefined,
		image: row.image ?? undefined,
		video: row.video ?? undefined,
		points: parseJson<MapData['points']>(row.points, []),
	};
}

function normalizeMapType(value: unknown): MapData['type'] | undefined {
	if (typeof value !== 'string') return undefined;
	const type = value.toLowerCase();
	if (type === 'normal' || type === 'extend' || type === 'scan') return type;
	return undefined;
}

function normalizeBackground(value: unknown): MapData['background'] | undefined {
	if (typeof value !== 'string') return undefined;
	const background = value.replace(/\.png$/i, '').toLowerCase();
	if (
		background === 'mondstadt' ||
		background === 'liyue' ||
		background === 'inazuma' ||
		background === 'sumeru' ||
		background === 'fontaine' ||
		background === 'natlan' ||
		background === 'snezhnaya'
	) {
		return background;
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
