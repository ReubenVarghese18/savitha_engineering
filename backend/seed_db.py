"""
Savitha Engineering  Seed Script (Phase 2)
============================================
Run from the /backend directory:
    python seed_db.py

Actions:
  1. Drops & recreates all SQLAlchemy tables (catalog.db)  clean slate.
  2. Seeds 5 real furnaces + their technical specs.
  3. Patches quotes.db to add a `status` column if missing.
  4. Seeds 4 Kanban RFQs with distinct statuses.
"""

import sqlite3
import json
from datetime import datetime

from app.database import SessionLocal, engine, Base

#  Import all models so Base.metadata knows about every table 
import app.furnaces.models
import app.enquiries.models
from app.furnaces.models import Furnace, TechnicalSpecs
from app.enquiries.models import Enquiry


# 
# STEP 1  Drop & recreate all SQLAlchemy tables (catalog.db)
# 
def reset_catalog_db():
    print("  Dropping all catalog tables...")
    Base.metadata.drop_all(bind=engine)
    print("  Tables dropped.")
    Base.metadata.create_all(bind=engine)
    print("  Tables recreated (clean slate).")


# 
# STEP 2  Seed furnaces + technical specs into catalog.db
# 
FURNACE_DATA = [
    {
        "furnace": {
            "name": "Aluminum Furnace",
            "category": "Heavy-Duty Melting Furnaces",
            "short_description": "Specialized melting equipment calibrated exclusively for aluminum processing. Offers precise thermal control to prevent oxidation, backed by a highly durable, abrasion-resistant chassis.",
        },
        "specs": {
            "max_temperature": "Up to 1000C",
            "power_rating": "120 kW",
            "dimensions": "Custom Engineered to Capacity",
        },
    },
    {
        "furnace": {
            "name": "Ferrous Melting Furnaces",
            "category": "Heavy-Duty Melting Furnaces",
            "short_description": "High-capacity industrial furnace engineered for rapid melting of ferrous metals and steel alloys with superior thermal efficiency.",
        },
        "specs": {
            "max_temperature": "Up to 1650C",
            "power_rating": "Custom kW",
            "dimensions": "Custom Engineered to Capacity",
        },
    },
    {
        "furnace": {
            "name": "High Temperature Muffle Furnace",
            "category": "Industrial Batch & Box Furnaces",
            "short_description": "Heavy-duty muffle furnace upgraded for elevated temperature thresholds. Features an abrasion-resistant build, seamless installation, and exceptional lifespan for rigorous industrial use.",
        },
        "specs": {
            "max_temperature": "Up to 1400C",
            "power_rating": "75 kW",
            "dimensions": "1.0m x 0.8m x 1.0m",
        },
    },
    {
        "furnace": {
            "name": "Pit Type Annealing Furnaces",
            "category": "Precision Annealing Systems",
            "short_description": "Sealed retort-type vertical furnaces specializing in the bright annealing of copper tubes and pancake coils in the complete absence of atmospheric air.",
        },
        "specs": {
            "max_temperature": "Up to 1200C",
            "power_rating": "200 kW",
            "dimensions": "1.5m diameter x 2.5m depth",
        },
    },
    {
        "furnace": {
            "name": "Bogie Type Furnace",
            "category": "Industrial Batch & Box Furnaces",
            "short_description": "Heavy-load batch furnaces configured with a motorized bogie hearth. Designed precisely to billet dimensions, ensuring flawless thermal distribution for heavy extrusion and forging operations.",
        },
        "specs": {
            "max_temperature": "Up to 1300C",
            "power_rating": "250 kW",
            "dimensions": "Custom Engineered to Capacity",
        },
    },
]


def seed_furnaces(db):
    print("\n  Seeding furnaces...")
    for item in FURNACE_DATA:
        furnace = Furnace(**item["furnace"])
        db.add(furnace)
        db.flush()  # get the auto-generated furnace.id

        specs = TechnicalSpecs(furnace_id=furnace.id, **item["specs"])
        db.add(specs)

    db.commit()
    print(f"  {len(FURNACE_DATA)} furnaces + specs seeded into catalog.db.")


# 
# STEP 3  Patch quotes.db: add status column if missing
# 
KANBAN_QUOTES = [
    {
        "full_name": "Rajesh Kumar",
        "company": "Tata Steel",
        "category": "Heavy-Duty Melting Furnaces",
        "requirement_details": "Require 2x ferrous melting furnaces rated at 1600C with gas fuel. Capacity: 5 tonnes/hr. Delivery expected within 90 days.",
        "requested_assets": ["Datasheet", "3D CAD Drawing"],
        "status": "Pending",
    },
    {
        "full_name": "Anil Sharma",
        "company": "JSW Steel",
        "category": "Industrial Batch & Box Furnaces",
        "requirement_details": "Custom bogie hearth furnace for large forged components. Internal chamber 3m x 2m x 1.8m. Electric-powered, 3-phase 415V.",
        "requested_assets": ["Engineering Proposal", "Site Visit"],
        "status": "Designing",
    },
    {
        "full_name": "Priya Mehta",
        "company": "Hindalco Industries",
        "category": "Precision Annealing Systems",
        "requirement_details": "Pit-type annealing furnace for copper pancake coils. Bright annealing under protective atmosphere. Capacity 800 kg/batch.",
        "requested_assets": ["Datasheet"],
        "status": "Manufacturing",
    },
    {
        "full_name": "Suresh Nair",
        "company": "Bharat Forge",
        "category": "High-Temperature Forging Furnaces",
        "requirement_details": "Billet heating furnace for extrusion press line. Continuous push-type, target temp 1250C, gas-fired. Integration with existing SCADA required.",
        "requested_assets": ["3D CAD Drawing", "SCADA Integration Spec"],
        "status": "Testing",
    },
]


def patch_and_seed_quotes_db():
    conn = sqlite3.connect("quotes.db")
    cursor = conn.cursor()

    # Ensure base table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            company TEXT NOT NULL,
            category TEXT NOT NULL,
            requirement_details TEXT NOT NULL,
            requested_assets TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Patch in status column if this is an older table without it
    try:
        cursor.execute("ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'Pending'")
        print("\n  'status' column added to quotes table.")
    except sqlite3.OperationalError:
        print("\n   'status' column already exists  skipping ALTER.")

    conn.commit()

    # Inject the 4 Kanban RFQs
    print("  Seeding Kanban RFQs into quotes.db...")
    for q in KANBAN_QUOTES:
        assets_json = json.dumps(q["requested_assets"])
        cursor.execute(
            """INSERT INTO quotes
               (full_name, company, category, requirement_details, requested_assets, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                q["full_name"],
                q["company"],
                q["category"],
                q["requirement_details"],
                assets_json,
                q["status"],
                datetime.utcnow().isoformat(),
            ),
        )

    conn.commit()
    conn.close()
    print(f"  {len(KANBAN_QUOTES)} Kanban RFQs seeded into quotes.db.")
    print("      Tata Steel      Pending")
    print("      JSW Steel       Designing")
    print("      Hindalco        Manufacturing")
    print("      Bharat Forge    Testing")


# 
# MAIN
# 
if __name__ == "__main__":
    print("=" * 55)
    print("  SAVITHA ENGINEERING  PHASE 2 SEED ENGINE")
    print("=" * 55)

    # 1. catalog.db  clean slate + furnaces
    reset_catalog_db()
    db = SessionLocal()
    try:
        seed_furnaces(db)
    finally:
        db.close()

    # 2. quotes.db  patch + kanban data
    patch_and_seed_quotes_db()

    print("\n" + "=" * 55)
    print("    SEED COMPLETE  backend is ready to launch.")
    print("=" * 55)
