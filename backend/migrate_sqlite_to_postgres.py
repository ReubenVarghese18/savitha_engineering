"""Copy the SQLite catalog into a PostgreSQL database.

Usage (from backend/, venv active):
    python migrate_sqlite_to_postgres.py --target postgresql://user:pass@localhost:5432/savitha
    python migrate_sqlite_to_postgres.py --target ... --skip-quote-name RL

Refuses to run if the target already contains rows.
"""
import argparse
import os
import sys

parser = argparse.ArgumentParser()
parser.add_argument("--source", default="sqlite:///./catalog.db")
parser.add_argument("--target", required=True)
parser.add_argument("--skip-quote-name", action="append", default=[],
                    help="Skip quotes whose full_name equals this value (repeatable)")
args = parser.parse_args()

# app.database and alembic's env.py read DATABASE_URL at import time, so it
# must point at the target before anything from `app` is imported.
os.environ["DATABASE_URL"] = args.target

from sqlalchemy import create_engine, select, text, func  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from app.database import Base, engine as dst  # noqa: E402
import app.furnaces.models  # noqa: E402,F401
import app.enquiries.models  # noqa: E402,F401
import app.quotes.models  # noqa: E402,F401
import app.purchase_orders.models  # noqa: E402,F401

src = create_engine(args.source)
tables = Base.metadata.sorted_tables

Base.metadata.create_all(dst)

with dst.connect() as conn:
    for t in tables:
        if conn.execute(select(func.count()).select_from(t)).scalar():
            sys.exit(f"Target table '{t.name}' already has rows; aborting.")

copied = {}
with src.connect() as sconn, dst.begin() as dconn:
    for t in tables:
        rows = [dict(r._mapping) for r in sconn.execute(select(t))]
        if t.name == "quotes" and args.skip_quote_name:
            rows = [r for r in rows if r["full_name"] not in args.skip_quote_name]
        if rows:
            dconn.execute(t.insert(), rows)
        copied[t.name] = len(rows)

    if dst.dialect.name == "postgresql":
        for t in tables:
            if "id" in t.c:
                dconn.execute(text(
                    f"SELECT setval(pg_get_serial_sequence('{t.name}', 'id'), "
                    f"COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM {t.name}"
                ))

with dst.connect() as conn:
    for t in tables:
        n = conn.execute(select(func.count()).select_from(t)).scalar()
        assert n == copied[t.name], f"{t.name}: copied {copied[t.name]} but target has {n}"
        print(f"{t.name:18} {n} rows")

command.stamp(Config("alembic.ini"), "head")
print("Done. Alembic stamped at head.")
