import { type MapData, type RouteData } from './types';
import { error } from './utils';

let schemaPromise: Promise<void> | null = null;

export function ensureSchema(env: Env) {
	if (!schemaPromise) {
		schemaPromise = env.DB.exec(
			`
			CREATE TABLE IF NOT EXISTS routes (
				id TEXT PRIMARY KEY,
				data TEXT NOT NULL,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
			CREATE TABLE IF NOT EXISTS maps (
				id TEXT PRIMARY KEY,
				data TEXT NOT NULL,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
		`,
		)
			.then(() => undefined)
			.catch((cause) => {
				schemaPromise = null;
				throw cause;
			});
	}

	return schemaPromise;
}

export async function getAllRoutesFromDb(env: Env) {
	await ensureSchema(env);
	const result = await env.DB.prepare('SELECT data FROM routes ORDER BY id').all<{
		data: string;
	}>();
	return result.results.map((row) => parseData<RouteData>(row.data, 'route'));
}

export async function getRouteFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const row = await env.DB.prepare('SELECT data FROM routes WHERE id = ?')
		.bind(id)
		.first<{ data: string }>();
	if (!row) throw error('Route not found', 404);
	return parseData<RouteData>(row.data, 'route');
}

export async function saveRouteToDb(env: Env, routeData: RouteData) {
	await ensureSchema(env);
	await env.DB.prepare(
		`INSERT INTO routes (id, data, updated_at)
		 VALUES (?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
	)
		.bind(routeData.id, JSON.stringify(routeData))
		.run();
}

export async function deleteRouteFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const result = await env.DB.prepare('DELETE FROM routes WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Route not found', 404);
}

export async function getAllMapsFromDb(env: Env) {
	await ensureSchema(env);
	const result = await env.DB.prepare('SELECT data FROM maps ORDER BY id').all<{ data: string }>();
	return result.results.map((row) => parseData<MapData>(row.data, 'map'));
}

export async function getMapFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const row = await env.DB.prepare('SELECT data FROM maps WHERE id = ?')
		.bind(id)
		.first<{ data: string }>();
	if (!row) throw error('Map not found', 404);
	return parseData<MapData>(row.data, 'map');
}

export async function saveMapToDb(env: Env, mapData: MapData) {
	await ensureSchema(env);
	await env.DB.prepare(
		`INSERT INTO maps (id, data, updated_at)
		 VALUES (?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
	)
		.bind(mapData.id, JSON.stringify(mapData))
		.run();
}

export async function deleteMapFromDb(env: Env, id: string) {
	await ensureSchema(env);
	const result = await env.DB.prepare('DELETE FROM maps WHERE id = ?').bind(id).run();
	if (!result.meta.changes) throw error('Map not found', 404);
}

function parseData<T>(value: string, type: string) {
	try {
		return JSON.parse(value) as T;
	} catch {
		throw error(`Invalid ${type} data`, 500);
	}
}
