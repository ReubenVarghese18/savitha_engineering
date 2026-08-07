"""
migrate_catalog.py
==================
Reads backend/products_data.json and ingests all 48 products into catalog.db.

Usage (from the backend/ directory with venv active):
    python migrate_catalog.py

Strategy:
  - Drop & recreate the furnaces + technical_specs tables (clean slate).
  - Insert every product from the JSON as a Furnace + linked TechnicalSpecs row.
  - The enquiries table is left untouched.
"""

import json
import sys
import os

# ── Make sure Python can find the 'app' package regardless of cwd ─────────────
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base

# Import models so Base.metadata knows about all tables
import app.furnaces.models   # registers Furnace, TechnicalSpecs
import app.enquiries.models  # registers Enquiry (so it is not orphaned on create_all)

from app.furnaces.models import Furnace, TechnicalSpecs


# ── 1. Locate the JSON file ───────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
JSON_PATH   = os.path.join(SCRIPT_DIR, "products_data.json")

if not os.path.exists(JSON_PATH):
    print(f"[ERROR] Cannot find {JSON_PATH}")
    sys.exit(1)

with open(JSON_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"[INFO] Loaded {len(products)} products from products_data.json")


# ── 2. Wipe only furnaces + technical_specs, leave enquiries intact ───────────
print("[INFO] Dropping and recreating furnaces + technical_specs tables ...")

TechnicalSpecs.__table__.drop(engine, checkfirst=True)
Furnace.__table__.drop(engine, checkfirst=True)

# Recreate all tables registered with Base (safe: uses checkfirst=True)
Base.metadata.create_all(bind=engine)
print("[INFO] Tables ready.")


# ── 3. Open a session and insert records ──────────────────────────────────────
db = SessionLocal()

try:
    inserted = 0

    for p in products:
        specs_raw = p.get("specifications", {}) or {}

        # -- Furnace row -------------------------------------------------------
        furnace = Furnace(
            sku               = p.get("sku")        or p.get("id"),
            product_id        = p.get("productId")  or p.get("id"),
            name              = p.get("title",       ""),
            category          = p.get("category",    ""),
            material          = p.get("material",    ""),
            fuel              = p.get("fuel",        ""),
            operation         = p.get("operation",   ""),
            temp_text         = p.get("tempText",    ""),
            max_temp_val      = float(p["maxTempVal"]) if p.get("maxTempVal") is not None else None,
            description       = p.get("description", ""),
            short_description = specs_raw.get("shortDescription", ""),
        )

        # -- TechnicalSpecs row ------------------------------------------------
        specs = TechnicalSpecs(
            specific_max_temp    = specs_raw.get("specificMaxTemp"),
            heating_element      = specs_raw.get("heatingElement"),
            thermocouple         = specs_raw.get("thermocouple"),
            electrical_phase     = specs_raw.get("electricalPhase"),
            insulation           = specs_raw.get("insulation"),
            dimensions           = specs_raw.get("dimensions"),
            max_temperature      = specs_raw.get("specificMaxTemp"),   # backward compat alias
            power_rating         = specs_raw.get("electricalPhase"),   # backward compat alias
            precision_control    = specs_raw.get("precisionControl"),
            structural_integrity = specs_raw.get("structuralIntegrity"),
        )

        furnace.specs = specs
        db.add(furnace)
        inserted += 1

    db.commit()
    print(f"[SUCCESS] Committed {inserted} furnace records to catalog.db")

except Exception as exc:
    db.rollback()
    print(f"[ERROR] Migration failed: {exc}")
    raise

finally:
    db.close()


# ── 4. Quick verification query ───────────────────────────────────────────────
from sqlalchemy import text

with engine.connect() as conn:
    furnace_count = conn.execute(text("SELECT COUNT(*) FROM furnaces")).scalar()
    specs_count   = conn.execute(text("SELECT COUNT(*) FROM technical_specs")).scalar()

print(f"[VERIFY] furnaces table     : {furnace_count} rows")
print(f"[VERIFY] technical_specs table: {specs_count} rows")

if furnace_count == len(products) and specs_count == len(products):
    print("[VERIFY] All records present. Migration complete.")
else:
    print(f"[WARN] Expected {len(products)} rows in each table. Check for issues.")
