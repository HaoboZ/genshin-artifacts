#!/usr/bin/env bash
set -euo pipefail

# Local backup + restore for the route-storage R2 bucket.
#
# Requirements:
# - rclone installed and configured with one remote that points to live R2.
#
# Usage:
#   ./scripts/r2-backup-sync.sh backup
#   ./scripts/r2-backup-sync.sh push
#
# Actions:
#   backup - download everything from live R2 to local backup directory
#   push   - upload local backup directory to live R2
#
# Optional env vars:
#   ROUTE_STORAGE_SOURCE_REMOTE=cf-live
#   ROUTE_STORAGE_BUCKET=artifact-routes
#   ROUTE_STORAGE_LOCAL_BACKUP_DIR=./backups/route-storage

SOURCE_REMOTE="${ROUTE_STORAGE_SOURCE_REMOTE:-cf-live}"
BUCKET="${ROUTE_STORAGE_BUCKET:-artifact-routes}"
LOCAL_BACKUP_DIR="${ROUTE_STORAGE_LOCAL_BACKUP_DIR:-./backups/route-storage}"
ACTION="${1:-backup}"

source_path="${SOURCE_REMOTE}:${BUCKET}"

if ! command -v rclone >/dev/null 2>&1; then
	echo "rclone is required. Install: https://rclone.org/install/"
	exit 1
fi

if ! rclone lsf "$source_path" >/dev/null 2>&1; then
	echo "Cannot access source remote: $source_path"
	exit 1
fi

backup_local() {
	mkdir -p "$LOCAL_BACKUP_DIR"
	echo "Backing up live R2 to local directory: ${source_path} -> ${LOCAL_BACKUP_DIR}"
	rclone sync "$source_path" "$LOCAL_BACKUP_DIR" --fast-list --create-empty-src-dirs
}

push_local() {
	if [ ! -d "$LOCAL_BACKUP_DIR" ]; then
		echo "Local backup directory not found: $LOCAL_BACKUP_DIR"
		exit 1
	fi

	echo "Pushing local backup to live R2: ${LOCAL_BACKUP_DIR} -> ${source_path}"
	rclone sync "$LOCAL_BACKUP_DIR" "$source_path" --fast-list --create-empty-src-dirs
}

case "$ACTION" in
	backup)
		backup_local
		;;
	push)
		push_local
		;;
	*)
		echo "Unknown action: $ACTION"
		echo "Expected one of: backup | push"
		exit 1
		;;
esac

echo "Done."
