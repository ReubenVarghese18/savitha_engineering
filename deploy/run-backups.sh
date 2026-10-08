#!/bin/sh
# Daily PostgreSQL backups for the production stack (runs in the "backup" service).
# Writes /backups/savitha-YYYY-MM-DD-HHMM.dump and deletes files older than BACKUP_KEEP_DAYS.
# Restore: pg_restore --clean --if-exists -h db -U savitha -d savitha <file>.dump
set -u
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"

while true; do
  name="savitha-$(date +%Y-%m-%d-%H%M).dump"
  if pg_dump -h db -U savitha --format=custom savitha > "/backups/$name.part"; then
    mv "/backups/$name.part" "/backups/$name"
    echo "backup: wrote $name ($(du -h "/backups/$name" | cut -f1))"
  else
    rm -f "/backups/$name.part"
    echo "backup: FAILED at $(date)" >&2
  fi
  find /backups -name 'savitha-*.dump' -mtime +"$KEEP_DAYS" -delete
  sleep "$INTERVAL"
done
