"""Run before the API starts in production.

A brand-new database is built from the models and then marked as being at the
latest migration. An existing database is brought up to date with the
migrations. (The first migration is an empty baseline, so migrations alone
cannot build an empty database.)
"""
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from app.database import Base, engine
import app.furnaces.models  # noqa: F401
import app.enquiries.models  # noqa: F401
import app.quotes.models  # noqa: F401
import app.purchase_orders.models  # noqa: F401

cfg = Config("alembic.ini")

if "alembic_version" in inspect(engine).get_table_names():
    print("prestart: existing database, applying migrations")
    command.upgrade(cfg, "head")
else:
    print("prestart: new database, creating tables and stamping migrations")
    Base.metadata.create_all(bind=engine)
    command.stamp(cfg, "head")
print("prestart: done")
