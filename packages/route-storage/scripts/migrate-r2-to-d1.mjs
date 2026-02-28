#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const sourceUrl = (process.env.ROUTE_STORAGE_SOURCE_URL ?? '').replace(/\/$/, '');
const database = process.env.ROUTE_STORAGE_D1_DATABASE ?? 'artifact-routes';
const outputPath = resolve(
	process.cwd(),
	process.env.ROUTE_STORAGE_MIGRATION_SQL_PATH ?? './tmp/migrate-r2-to-d1.sql',
);

if (!sourceUrl) {
	throw new Error(
		'Missing ROUTE_STORAGE_SOURCE_URL (example: https://your-worker.example.workers.dev)',
	);
}

console.log(`Fetching route/map payloads from ${sourceUrl} ...`);
const [routes, maps] = await Promise.all([
	fetchJson(`${sourceUrl}/routes`),
	fetchJson(`${sourceUrl}/maps`),
]);

if (!Array.isArray(routes) || !Array.isArray(maps)) {
	throw new Error('Expected /routes and /maps to return JSON arrays');
}

const sql = buildSql(routes, maps);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql);
console.log(`SQL written to ${outputPath}`);
console.log(`Maps: ${maps.length}, Routes: ${routes.length}`);

if (dryRun) {
	console.log('--dry-run set, skipping D1 execution.');
	process.exit(0);
}

console.log(`Applying migration SQL to D1 database '${database}' ...`);
execFileSync(
	'bunx',
	['wrangler', 'd1', 'execute', database, '--remote', '--file', outputPath, '--yes'],
	{ stdio: 'inherit', cwd: resolve(process.cwd(), '.') },
);

console.log('Migration complete.');

async function fetchJson(url) {
	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
	return await res.json();
}

function sqlValue(value) {
	if (value === undefined || value === null) return 'NULL';
	if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
	if (typeof value === 'boolean') return value ? '1' : '0';
	return `'${String(value).replaceAll("'", "''")}'`;
}

function buildSql(routes, maps) {
	const statements = [];
	statements.push('BEGIN;');
	statements.push('DELETE FROM route_maps;');
	statements.push('DELETE FROM routes;');
	statements.push('DELETE FROM maps;');

	for (const map of maps) {
		const points = JSON.stringify(Array.isArray(map.points) ? map.points : []);
		const text = map.text ? JSON.stringify(map.text) : null;
		const type = normalizeMapType(map.type);
		const background = normalizeBackground(map.background);
		statements.push(
			`INSERT INTO maps (id, name, owner, notes, type, text, background, spots, time, count, mora, efficiency, x, y, image, video, points, updated_at) VALUES (${sqlValue(map.id)}, ${sqlValue(map.name)}, ${sqlValue(map.owner)}, ${sqlValue(map.notes)}, ${sqlValue(type)}, ${sqlValue(text)}, ${sqlValue(background)}, ${sqlValue(map.spots)}, ${sqlValue(map.time)}, ${sqlValue(map.count)}, ${sqlValue(map.mora)}, ${sqlValue(map.efficiency)}, ${sqlValue(map.x)}, ${sqlValue(map.y)}, ${sqlValue(map.image)}, ${sqlValue(map.video)}, ${sqlValue(points)}, CURRENT_TIMESTAMP);`,
		);
	}

	for (const route of routes) {
		const routeMaps = Array.isArray(route.maps) ? route.maps : [];
		statements.push(
			`INSERT INTO routes (id, name, owner, notes, updated_at) VALUES (${sqlValue(route.id)}, ${sqlValue(route.name)}, ${sqlValue(route.owner)}, ${sqlValue(route.notes)}, CURRENT_TIMESTAMP);`,
		);
		routeMaps.forEach((mapId, index) => {
			statements.push(
				`INSERT INTO route_maps (route_id, map_id, sort_order) VALUES (${sqlValue(route.id)}, ${sqlValue(mapId)}, ${sqlValue(index)});`,
			);
		});
	}

	statements.push('COMMIT;');
	statements.push('');
	return statements.join('\n');
}

function normalizeBackground(value) {
	if (typeof value !== 'string') return null;
	return value.replace(/\.png$/i, '').toLowerCase();
}

function normalizeMapType(value) {
	if (typeof value !== 'string') return null;
	const type = value.toLowerCase();
	return ['normal', 'extend', 'scan'].includes(type) ? type : null;
}
