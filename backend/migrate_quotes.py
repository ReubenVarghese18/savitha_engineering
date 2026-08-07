import sqlite3
import json
from datetime import datetime

# Connect to the old quotes DB
old_conn = sqlite3.connect("quotes.db")
old_cursor = old_conn.cursor()

try:
    old_cursor.execute("SELECT * FROM quotes")
    rows = old_cursor.fetchall()
except sqlite3.OperationalError:
    rows = []

# Connect to the new catalog DB
new_conn = sqlite3.connect("catalog.db")
new_cursor = new_conn.cursor()

for row in rows:
    # Schema in old quotes: id, full_name, company, category, requirement_details, requested_assets, created_at, base_price, lead_time, payment_terms, notes
    # Let's map it based on column names.
    old_cursor.execute("PRAGMA table_info(quotes)")
    columns = [col[1] for col in old_cursor.fetchall()]
    row_dict = dict(zip(columns, row))
    
    # Insert into new quotes table
    new_cursor.execute("""
        INSERT INTO quotes (
            id, full_name, company, category, requirement_details, requested_assets, created_at, 
            base_price, lead_time, payment_terms, notes, is_custom_request, custom_details, equipment_serial_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        row_dict.get("id"),
        row_dict.get("full_name", ""),
        row_dict.get("company", ""),
        row_dict.get("category", ""),
        row_dict.get("requirement_details", ""),
        row_dict.get("requested_assets", "[]"),
        row_dict.get("created_at"),
        row_dict.get("base_price"),
        row_dict.get("lead_time"),
        row_dict.get("payment_terms"),
        row_dict.get("notes"),
        False, # is_custom_request
        None,  # custom_details
        None   # equipment_serial_number
    ))

new_conn.commit()
old_conn.close()
new_conn.close()

print("Data migration completed successfully.")
