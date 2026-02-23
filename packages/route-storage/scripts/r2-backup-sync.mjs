#!/usr/bin/env node

import { existsSync, mkdirSync } from 'node:fs';
import process from 'node:process';
import { spawn } from 'node:child_process';

const SOURCE_REMOTE = process.env.ROUTE_STORAGE_SOURCE_REMOTE ?? 'cf-live';
const BUCKET = process.env.ROUTE_STORAGE_BUCKET ?? 'artifact-routes';
const LOCAL_BACKUP_DIR = process.env.ROUTE_STORAGE_LOCAL_BACKUP_DIR ?? './backups/route-storage';
const ACTION = process.argv[2] ?? 'backup';

const sourcePath = `${SOURCE_REMOTE}:${BUCKET}`;

const HELP_TEXT = `Local backup + restore for the route-storage R2 bucket.

Usage:
  node ./scripts/r2-backup-sync.mjs backup
  node ./scripts/r2-backup-sync.mjs push

Actions:
  backup - download everything from live R2 to local backup directory
  push   - upload local backup directory to live R2

Optional env vars:
  ROUTE_STORAGE_SOURCE_REMOTE=cf-live
  ROUTE_STORAGE_BUCKET=artifact-routes
  ROUTE_STORAGE_LOCAL_BACKUP_DIR=./backups/route-storage
`;

async function run(cmd, args) {
	await new Promise((resolve, reject) => {
		const child = spawn(cmd, args, {
			stdio: 'inherit',
			shell: process.platform === 'win32',
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) return resolve();
			reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
		});
	});
}

async function checkRclone() {
	try {
		await run('rclone', ['version']);
	} catch {
		console.error('rclone is required. Install: https://rclone.org/install/');
		process.exit(1);
	}
}

async function verifySource() {
	try {
		await run('rclone', ['lsf', sourcePath]);
	} catch {
		console.error(`Cannot access source remote: ${sourcePath}`);
		process.exit(1);
	}
}

async function backupLocal() {
	mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
	console.log(`Backing up live R2 to local directory: ${sourcePath} -> ${LOCAL_BACKUP_DIR}`);
	await run('rclone', ['sync', sourcePath, LOCAL_BACKUP_DIR, '--fast-list', '--create-empty-src-dirs']);
}

async function pushLocal() {
	if (!existsSync(LOCAL_BACKUP_DIR)) {
		console.error(`Local backup directory not found: ${LOCAL_BACKUP_DIR}`);
		process.exit(1);
	}

	console.log(`Pushing local backup to live R2: ${LOCAL_BACKUP_DIR} -> ${sourcePath}`);
	await run('rclone', ['sync', LOCAL_BACKUP_DIR, sourcePath, '--fast-list', '--create-empty-src-dirs']);
}

async function main() {
	if (ACTION === '--help' || ACTION === '-h') {
		console.log(HELP_TEXT);
		return;
	}

	await checkRclone();
	await verifySource();

	if (ACTION === 'backup') {
		await backupLocal();
		console.log('Done.');
		return;
	}

	if (ACTION === 'push') {
		await pushLocal();
		console.log('Done.');
		return;
	}

	console.error(`Unknown action: ${ACTION}`);
	console.error('Expected one of: backup | push');
	process.exit(1);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
