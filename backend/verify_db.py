from app.database import SessionLocal
from app.furnaces.models import Furnace
from app.enquiries.models import Enquiry

def verify_data():
    db = SessionLocal()
    
    # Query all furnaces
    furnaces = db.query(Furnace).all()
    
    print("--- Database Verification ---\n")
    if not furnaces:
        print("No furnaces found in the database.")
    
    for f in furnaces:
        print(f"Furnace ID : {f.id}")
        print(f"Name       : {f.name}")
        print(f"Category   : {f.category}")
        print(f"Description: {f.short_description}")
        
        if f.specs:
            print(f"Specs      : Max Temp: {f.specs.max_temperature} | Power: {f.specs.power_rating} | Dimensions: {f.specs.dimensions}")
        else:
            print("Specs      : None")
        
        print("-" * 50)

    db.close()

if __name__ == "__main__":
    verify_data()
