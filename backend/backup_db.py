"""Back up the database configured by DATABASE_URL.

Usage (from backend/, venv active):
    python backup_db.py                      # writes to ./backups, keeps the newest 14
    python backup_db.py --dir D:/backups --keep 30

SQLite: uses SQLite's online backup API (safe while the app is running).
PostgreSQL: runs pg_dump (custom format). Set PG_DUMP_CMD to override the
command, e.g. PG_DUMP_CMD="docker exec my-db-container pg_dump".

Restore:
    SQLite:      copy the .db file back over catalog.db (stop the app first)
    PostgreSQL:  pg_restore --clean --if-exists -d <DATABASE_URL> <file>.dump
"""
import argparse
import os
import shlex
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import make_url

load_dotenv()

parser = argparse.ArgumentParser()
parser.add_argument("--dir", default="backups")
parser.add_argument("--keep", type=int, default=14)
args = parser.parse_args()

url = os.environ.get("DATABASE_URL", "sqlite:///./catalog.db")
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)
url = url.replace("postgresql+psycopg2://", "postgresql://", 1)

out_dir = Path(args.dir)
out_dir.mkdir(parents=True, exist_ok=True)
stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

if url.startswith("sqlite"):
    src_path = make_url(url).database
    if not Path(src_path).exists():
        sys.exit(f"SQLite database not found: {src_path}")
    suffix, glob = ".db", "catalog-*.db"
    target = out_dir / f"catalog-{stamp}.db"
    with sqlite3.connect(src_path) as src, sqlite3.connect(target) as dst:
        src.backup(dst)
else:
    suffix, glob = ".dump", "savitha-*.dump"
    target = out_dir / f"savitha-{stamp}.dump"
    cmd = shlex.split(os.environ.get("PG_DUMP_CMD", "pg_dump")) + ["--format=custom", url]
    try:
        with open(target, "wb") as fh:
            result = subprocess.run(cmd, stdout=fh, stderr=subprocess.PIPE)
    except FileNotFoundError:
        target.unlink(missing_ok=True)
        sys.exit("pg_dump not found. Install PostgreSQL client tools or set PG_DUMP_CMD.")
    if result.returncode != 0:
        target.unlink(missing_ok=True)
        sys.exit(f"pg_dump failed: {result.stderr.decode(errors='replace').strip()}")

if target.stat().st_size == 0:
    target.unlink()
    sys.exit("Backup produced an empty file; removed it.")

for old in sorted(out_dir.glob(glob))[:-args.keep]:
    old.unlink()

print(f"Backup written: {target} ({target.stat().st_size} bytes)")
