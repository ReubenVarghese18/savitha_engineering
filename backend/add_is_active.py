import sqlite3

try:
    conn = sqlite3.connect('backend/catalog.db')
    c = conn.cursor()
    c.execute('ALTER TABLE furnaces ADD COLUMN is_active BOOLEAN DEFAULT 1;')
    conn.commit()
    print("Column is_active added successfully.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column is_active already exists.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
